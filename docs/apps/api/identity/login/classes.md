# Login — Diagrama de Clases

> Artefactos involucrados en `POST /auth/login`

```mermaid
classDiagram
    class LoginAuthPostController {
        -useCase: UserLogger
        +handler(payload, res): Promise~void~
    }

    class LoginAuthPostPayload {
        +email: string
        +password: string
        +guestDeviceId?: string
    }

    class UserLogger {
        -userRepo: UserRepository
        -refreshTokenRepo: RefreshTokenRepository
        -passwordService: PasswordService
        -tokenService: TokenService
        +execute(req): Promise~UserLoginResult~
    }

    class User {
        +id: UserId
        +email: Email
        +passwordHash: PasswordHash | null
        +role: UserRole
        +fromPrimitives(p)$ User
        +toPrimitives(): UserPrimitives
    }

    class PasswordService {
        <<interface>>
        +compare(plain, hash): Promise~boolean~
    }

    class InvalidCredentials {
        +message: string
        +statusCode: 401
    }

    LoginAuthPostController --> LoginAuthPostPayload : valida
    LoginAuthPostController --> UserLogger : invoca
    UserLogger --> UserRepository : busca por email
    UserLogger --> PasswordService : compara hash
    UserLogger --> RefreshTokenRepository : persiste token
    UserLogger ..> InvalidCredentials : lanza si email/password inválidos
    PasswordService ..> User : usa passwordHash de
```
