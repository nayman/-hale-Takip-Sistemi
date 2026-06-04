import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const error = searchParams.get('error')
  
  if (!error) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  let errorMessage = "Bilinmeyen bir hata oluştu"
  let errorDescription = ""

  switch (error) {
    case 'Configuration':
      errorMessage = "NextAuth konfigürasyon hatası"
      errorDescription = "Lütfen sistem yöneticisi ile iletişime geçin"
      break
    case 'AccessDenied':
      errorMessage = "Erişim reddedildi"
      errorDescription = "Bu işlem için yetkiniz bulunmuyor"
      break
    case 'Verification':
      errorMessage = "Email doğrulanamadı"
      errorDescription = "Email adresiniz doğrulanamadı"
      break
    case 'CredentialsSignin':
      errorMessage = "Geçersiz email veya şifre"
      errorDescription = "Email veya şifrenizi kontrol edin"
      break
    case 'OAuthSignin':
      errorMessage = "OAuth giriş hatası"
      errorDescription = "OAuth sağlayıcısı ile giriş yapılamadı"
      break
    case 'OAuthCallback':
      errorMessage = "OAuth callback hatası"
      errorDescription = "OAuth sağlayıcısı ile bağlantı kurulamadı"
      break
    case 'OAuthCreateAccount':
      errorMessage = "OAuth hesap oluşturma hatası"
      errorDescription = "OAuth sağlayıcısı ile hesap oluşturulamadı"
      break
    case 'EmailCreateAccount':
      errorMessage = "Email hesap oluşturma hatası"
      errorDescription = "Email ile hesap oluşturulurken hata oluştu"
      break
    case 'Callback':
      errorMessage = "Callback hatası"
      errorDescription = "İşlem sırasında bir hata oluştu"
      break
    case 'SessionRequired':
      errorMessage = "Oturum gerekli"
      errorDescription = "Bu işlem için oturum açmanız gerekiyor"
      break
    case 'Default':
      errorMessage = "Beklenmeyen bir hata"
      errorDescription = "Beklenmeyen bir hata oluştu"
      break
  }

  return NextResponse.json({
    error: errorMessage,
    description: errorDescription,
    code: error
  })
}
