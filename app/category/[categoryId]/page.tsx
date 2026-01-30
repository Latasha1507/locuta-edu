import { redirect } from 'next/navigation'

export default async function CategoryRedirect({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params
  redirect(`/category/${categoryId}/modules`)
}