// Alternative implementation for category page using two-step query pattern
// This follows the same pattern as the arena page which works reliably

async function getCategoryWithGoals(slug: string) {
  const supabase = await createSupabaseServerClient()
  
  console.log('Looking for category with slug:', slug)
  
  // Step 1: Get the category with arena info
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select(`
      *,
      arenas!inner (
        id,
        name,
        slug,
        icon
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  if (categoryError || !category) {
    console.log('Category fetch error:', categoryError)
    return null
  }
  
  console.log('Category found:', category.name, 'with ID:', category.id)
  
  // Step 2: Get approved goals for this category
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      description,
      slug,
      solution_count,
      view_count
    `)
    .eq('category_id', category.id)
    .eq('is_approved', true)
  
  console.log('Goals fetch result:', { 
    count: goals?.length || 0, 
    error: goalsError 
  })
  
  return {
    ...category,
    goals: goals || []
  } as Category
}