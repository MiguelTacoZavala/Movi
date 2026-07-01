const CULQI_PUBLIC_KEY = 'pk_test_f6AEx0AWORgoqNcs'

const culqi = {
  loaded: false,
  initPromise: null,

  load() {
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window.Culqi !== 'undefined') {
        this.loaded = true
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.culqi.com/js/v4'
      script.async = true
      script.onload = () => {
        if (window.Culqi) {
          window.Culqi.publicKey = CULQI_PUBLIC_KEY
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

  generarToken({ amount, description }) {
    return new Promise((resolve, reject) => {
      this.load()
        .then(() => {
          window.Culqi.options({
            lang: 'auto',
          })

          window.Culqi.settings({
            title: 'Movi',
            currency: 'PEN',
            description,
            amount: Math.round(amount * 100),
          })

          window.Culqi.open()

          window.Culqi.culqi = () => {
            if (window.Culqi.token) {
              resolve(window.Culqi.token.id)
            } else if (window.Culqi.error) {
              reject(new Error(window.Culqi.error.user_message || 'Error en Culqi'))
            }
          }
        })
        .catch(reject)
    })
  },

  checkout({ amount, description, order }) {
    return new Promise((resolve, reject) => {
      this.load()
        .then(() => {
          window.Culqi.checkout({
            settings: {
              title: 'Movi',
              currency: 'PEN',
              amount: Math.round(amount * 100),
              description,
              order,
            },
            onSuccess: (charge) => resolve(charge),
            onError: (error) => reject(new Error(error.user_message || 'Error en Culqi')),
          })
        })
        .catch(reject)
    })
  },
}

export default culqi
