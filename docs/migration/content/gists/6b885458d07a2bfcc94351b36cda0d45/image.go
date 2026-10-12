func (i *Image) SetNewUUID(hashString string) error {
	strippedHash := strings.Replace(hashString, " ", "", -1)
	if len(strippedHash) == 0 {
		return fmt.Errorf("hash string cannot be empty")
	}
	i.Id = uuid.NewV5(i.Id, strippedHash)
	return nil
}
