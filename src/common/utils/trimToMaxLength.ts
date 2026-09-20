export const trimToMaxLength = (str: string, maxLength= 100)=> {
    return str.length > maxLength ? str.slice(0, maxLength - 3) + '...': str

}