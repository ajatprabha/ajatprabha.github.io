func (ip imageProcessor) ProcessResize(srcImage *domain.Image, requiredW, requiredH uint) error {
	source := imagick.NewMagickWand()
	defer source.Destroy()
	source.ReadImageBlob(srcImage.Data)
	actualW := source.GetImageWidth()
	actualH := source.GetImageHeight()
	resizeW, resizeH := getResizeWidthandHeight(requiredW, requiredH, actualW, actualH)  //Returns appropriate size to maintain the original aspect ratio of the image
	err = source.ResizeImage(resizeW, resizeH, imagick.FILTER_LANCZOS)
	if err != nil {
		return fmt.Errorf("unable to process image: %s", err.Error())
	}
	srcImage.Data = source.GetImageBlob()
	return nil
}