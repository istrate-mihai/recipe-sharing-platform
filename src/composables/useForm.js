import { ref, computed } from 'vue'

export function useForm(initialValues, validationRules = {}) {
  const values = ref(initialValues)
  const errors = ref({})
  const touched = ref({})
  const isSubmitting = ref(false)

  function validateField(field) {
    const rule = validationRules[field]
    if (!rule) return

    let result
    if (typeof rule === 'function') {
      result = rule(values.value[field])
    } else if (rule && rule.each) {
      // For arrays: rule.each is a function that validates each item
      const arr = values.value[field]
      if (!Array.isArray(arr)) {
        result = 'Expected an array'
      } else {
        const itemErrors = []
        arr.forEach((item, index) => {
          const itemResult = rule.each(item, index)
          if (itemResult !== true) {
            itemErrors.push(`Item ${index + 1}: ${itemResult}`)
          }
        })
        result = itemErrors.length ? itemErrors.join('; ') : true
      }
    }
    errors.value[field] = result === true ? '' : result
  }

  function touch(field) {
    touched.value[field] = true
    validateField(field)
  }

  function validate() {
    Object.keys(validationRules).forEach(field => {
      touched.value[field] = true
      validateField(field)
    })
    return Object.values(errors.value).every(e => !e)
  }

  function reset() {
    values.value = JSON.parse(JSON.stringify(initialValues)) // deep clone
    errors.value = {}
    touched.value = {}
  }

  const isValid = computed(() => Object.values(errors.value).every(e => !e))

  return { values, errors, touched, isSubmitting, isValid, touch, validate, reset }
}
