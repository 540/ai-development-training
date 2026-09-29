export const paths = {
  home: '/',
  details: '/vehicle/:id',
  compare: '/compare',
}

export const detailsPath = (id: string) => paths.details.replace(':id', id)
