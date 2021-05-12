  
export interface NotificationConfig {
    enabled: boolean
    secure: boolean
    from: string
    host: string
    port: number
    user: string
    pass: string
}

export interface EmailNotification {
    template: string
    subject: string
}

export interface User {
    email: string
    username: string
    name: string
}