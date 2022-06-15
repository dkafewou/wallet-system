import bcrypt from "bcrypt"

const SALT_ROUNDS = 5

export const corsHosts = (envUrls: string): string[] => {
  let urls = envUrls || ""
  return urls.split(",")
}

export const hashPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS)
  return bcrypt.hashSync(password, salt)
}

export const randomBoolean = (): boolean => {
  //80% probability of getting true
  return Math.random() < 0.8
}
