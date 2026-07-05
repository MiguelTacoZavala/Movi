const CULQI_PUBLIC_KEY = import.meta.env.VITE_CULQI_PUBLIC_KEY || 'pk_test_f6AEx0AWORgoqNcs'
const TOKEN_TIMEOUT_MS = 5 * 60 * 1000

const culqi = {
  loaded: false,
  initPromise: null,
  _culqiInstance: null,

  load() {
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window.CulqiCheckout !== 'undefined') {
        this.loaded = true
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://js.culqi.com/checkout-js'
      script.async = true
      script.onload = () => {
        if (window.CulqiCheckout) {
          this.loaded = true
          resolve()
        } else {
          reject(new Error('Culqi no se cargó correctamente'))
        }
      }
      script.onerror = () => reject(new Error('Error al cargar Culqi'))
      document.body.appendChild(script)
    })

    return this.initPromise
  },

  generarToken({ amount, email, description }) {
    return new Promise((resolve, reject) => {
      this.load()
        .then(() => {
          const config = {
            settings: {
              title: 'Movi',
              currency: 'PEN',
              amount: Math.round(amount * 100),
            },
            client: {
              email: email || 'cliente@movi.com',
            },
            options: {
              lang: 'auto',
              modal: true,
              installments: false,
              paymentMethods: {
                tarjeta: false,
                yape: true,
                billetera: false,
                bancaMovil: false,
                agente: false,
                cuotealo: false,
              },
            },
            appearance: {
              theme: 'default',
              hiddenCulqiLogo: false,
              hiddenBanner: false,
              hiddenToolBarAmount: false,
              menuType: 'select',
              buttonCardPayText: 'Pagar',
            },
          }

          this._culqiInstance = new window.CulqiCheckout(CULQI_PUBLIC_KEY, config)

          let settled = false

          const timeout = setTimeout(() => {
            if (!settled) {
              settled = true
              this._culqiInstance.close()
              reject(new Error('Tiempo de espera agotado. Intenta de nuevo.'))
            }
          }, TOKEN_TIMEOUT_MS)

          this._culqiInstance.culqi = () => {
            if (settled) return
            clearTimeout(timeout)
            settled = true

            if (this._culqiInstance.token) {
              const tokenId = this._culqiInstance.token.id
              this._culqiInstance.close()
              resolve(tokenId)
            } else if (this._culqiInstance.error) {
              const msg = this._culqiInstance.error.user_message || 'Error en Culqi'
              this._culqiInstance.close()
              reject(new Error(msg))
            } else {
              this._culqiInstance.close()
              reject(new Error('Pago cancelado'))
            }
          }

          this._culqiInstance.open()
        })
        .catch(reject)
    })
  },

  close() {
    if (this._culqiInstance) {
      try { this._culqiInstance.close() } catch {}
    }
  },
}

export default culqi
