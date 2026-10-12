func ImageCropResizeHandler(services *service.Services) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		imageId := vars["id"]
    		image := Image{Id: imageId}
		err := services.S3.GetApplicationImage(&image)
		if err != nil {
			e := json.NewEncoder(w)
			e.SetIndent("", "\t")
			w.Header().Set(contentType, jsonContentType)
			w.WriteHeader(http.StatusUnprocessableEntity)
			e.Encode(view.NewErrorResponse(err))
			return
		}
		v := r.URL.Query()
		width := v.Get("w")
		height := v.Get("h")
		if width != "" && height != "" {
			services.ImageProcessor.ProcessResize(&image, map[string]string{"w": width, "h": height})
		}
		w.Header().Set("Content-Length", strconv.Itoa(len(image.Data)))
		w.Write(image.Data)
	}
}
