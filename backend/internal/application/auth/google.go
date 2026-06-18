package auth

import (
	"net/http"
)

func (h *AuthHandler) GoogleOAuth(w http.ResponseWriter, r *http.Request) {
	// Обмежуємо частоту запитів навіть для нереалізованих ендпоінтів,
	// щоб запобігти флуду та вичерпванню ресурсів сервера.
	if !h.allow(w, r, "auth:google:"+r.RemoteAddr, 10, 60) {
		return
	}

	// ВИПРАВЛЕНО (Рядки 9-12): Повертаємо чіткий статус 501 замість 202.
	// Фронтенд тепер точно знає, що авторизація через Google ще не готова,
	// і зможе обробити цю помилку або тимчасово приховати кнопку на клієнті.
	respondJSON(w, http.StatusNotImplemented, map[string]string{
		"error": "Google OAuth is not yet implemented",
	})
}