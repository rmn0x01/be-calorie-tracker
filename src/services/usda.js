'use strict';

/**
 * Extract a specific nutrient from the foodNutrients array by its USDA number.
 * Returns { amount, unitName } or null if not found.
 */
function extractNutrient(nutrients, number) {
  if (!Array.isArray(nutrients)) return null;
  const match = nutrients.find((n) => String(n.number) === String(number));
  if (!match) return null;
  return {
    amount: match.amount ?? null,
    unitName: match.unitName ?? null,
  };
}

/**
 * Parse a raw USDA API food item into a simplified shape.
 */
function parseFoodItem(item) {
  const nutrients = item.foodNutrients;
  return {
    fdcId: item.fdcId,
    foodName: item.description ?? null,
    brandOwner: item.brandOwner ?? null,
    protein: extractNutrient(nutrients, '203'),
    totalFat: extractNutrient(nutrients, '204'),
    carbohydrate: extractNutrient(nutrients, '205'),
    energy: extractNutrient(nutrients, '208'),
  };
}

const USDAFoodService = {
  /**
   * Search the USDA FoodData Central API for foods matching the given query.
   * @param {string} query - The food name to search for.
   * @returns {Promise<Array<object>>} List of parsed food results.
   */
  async searchFoods(query) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw Object.assign(new Error('Query is required'), { statusCode: 400 });
    }

    const baseUrl = process.env.USDA_GOV_BASE_URL;
    const apiKey = process.env.USDA_GOV_API_KEY;

    if (!baseUrl) {
      throw Object.assign(new Error('USDA_GOV_BASE_URL is not configured'), {
        statusCode: 500,
      });
    }

    if (!apiKey) {
      throw Object.assign(new Error('USDA_GOV_API_KEY is not configured'), {
        statusCode: 500,
      });
    }

    const url = `${baseUrl}/foods/list?api_key=${apiKey}&query="${encodeURIComponent(query.trim())}"&pageSize=5`;

    const response = await fetch(url);

    if (!response.ok) {
      throw Object.assign(
        new Error(`USDA API responded with status ${response.status}`),
        { statusCode: 502 }
      );
    }

    const data = await response.json();
    return (Array.isArray(data) ? data : []).map(parseFoodItem);
  },
};

module.exports = USDAFoodService;
