const ACCESS_TOKEN_KEY = 'access_token'
const USER_ID_KEY = 'user_id'

export const accessTokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  getUserId: () => {
    const userId = Number(localStorage.getItem(USER_ID_KEY))
    return Number.isInteger(userId) && userId > 0 ? userId : null
  },
  setUserId: (userId: number) => localStorage.setItem(USER_ID_KEY, String(userId)),
  clearAccessToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(USER_ID_KEY)
  },
}