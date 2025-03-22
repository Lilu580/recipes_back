import express, { Request, Response, NextFunction }  from 'express';
import axios from 'axios';
interface Meal {
    strMeal: string,
    strMealThumb: string,
    idMeal: string
}
const router = express.Router();

const fetchRecipes: (url: string) => Promise<Meal[]> = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data.meals || [];
  } catch (error) {
    throw new Error('Error fetching recipes');
  }
};

router.get('/', async (req: Request, res: Response) => {
  const { ingredient, country, category, page, per_page } = req.query;

  const handledPage = page ?? '1'
  const handledPerPage = per_page ?? '12'
  let url = 'https://www.themealdb.com/api/json/v1/1/filter.php?'; 

  if (ingredient) {
    url += `i=${ingredient}&`;
  }

  if (country) {
    url += `a=${country}&`;
  }

  if (category) {
    url += `c=${category}`;
  }

  if(!category && !ingredient && !country) {
    url='https://www.themealdb.com/api/json/v1/1/search.php?s='
  }

  try {
    const meals = await fetchRecipes(url);
    console.log(url)
    const paginatedMeals = meals.slice((+handledPage - 1) * +handledPerPage, +handledPage * +handledPerPage)
    console.log(per_page)
    res.json({ paginatedMeals });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch recipes', error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

  try {
    const meals = await fetchRecipes(url);
    if (meals.length === 0) {
      res.status(404).json({ message: 'Recipe not found' });
      return
    }
    res.json({ meal: meals[0] });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch recipe details', error: error.message });
  }
});



export default router;
