func TestImageResizerServiceProcessSuccess(t *testing.T) {
	ip := imageProcessorService{}
	sourceData, _ := ioutil.ReadFile("_testdata/testImage.jpg")
	srcImage := &domain.Image{Data: sourceData}
	err := ip.ProcessResize(srcImage, map[string]string{"w": "400", "h": "300"})
	assert.Nil(t, err)
	processedImage := imagick.NewMagickWand()
	defer processedImage.Destroy()
	processedImage.ReadImageBlob(srcImage.Data)
	assert.Equal(t, processedImage.GetImageWidth(), uint(400))
	assert.Equal(t, processedImage.GetImageHeight(), uint(300))
}