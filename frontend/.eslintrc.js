module.exports = {
  extends: [
    'airbnb-base',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:prettier/recommended',
  ],

  rules: {
    'no-param-reassign': [
      'error',
      {
        ignorePropertyModificationsFor: ['currentState'],
      },
    ],
  },
}
