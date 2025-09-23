// Phone number validation for Iranian mobile numbers
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Check if it's a valid Iranian mobile number
  // Iranian mobile numbers start with 09 and have 11 digits total
  const iranianMobileRegex = /^09\d{9}$/
  
  return iranianMobileRegex.test(cleanPhone)
}

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('09')) {
    return cleanPhone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')
  }
  
  return phone
}

// Get phone validation error message
export const getPhoneValidationError = (phone: string): string => {
  if (!phone.trim()) {
    return 'شماره تلفن الزامی است'
  }
  
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length < 11) {
    return 'شماره تلفن باید 11 رقم باشد'
  }
  
  if (!cleanPhone.startsWith('09')) {
    return 'شماره تلفن باید با 09 شروع شود'
  }
  
  if (cleanPhone.length > 11) {
    return 'شماره تلفن نباید بیش از 11 رقم باشد'
  }
  
  if (!validatePhoneNumber(phone)) {
    return 'شماره تلفن نامعتبر است'
  }
  
  return ''
}
