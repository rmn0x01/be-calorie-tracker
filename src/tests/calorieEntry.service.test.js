jest.mock('../models/calorieEntry', () => ({ create: jest.fn() }))

const CalorieEntry = require('../models/calorieEntry')
const CalorieEntryService = require('../services/calorieEntry')

describe('CalorieEntryService.create', () => {
  const userId = 'user-uuid-123'
  const payload = {
    foodName: 'Apple',
    calorieAmount: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    quantity: 1,
    unit: 'piece',
    mealType: 'snack',
    notes: 'Fresh',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls CalorieEntry.create with userId and payload fields', async () => {
    const created = { id: 'entry-id', userId, ...payload }
    CalorieEntry.create.mockResolvedValue(created)

    const result = await CalorieEntryService.create(userId, payload)

    expect(CalorieEntry.create).toHaveBeenCalledTimes(1)
    expect(CalorieEntry.create).toHaveBeenCalledWith({
      userId,
      foodName: payload.foodName,
      calorieAmount: payload.calorieAmount,
      protein: payload.protein,
      carbs: payload.carbs,
      fat: payload.fat,
      quantity: payload.quantity,
      unit: payload.unit,
      mealType: payload.mealType,
      notes: payload.notes,
    })
    expect(result).toEqual(created)
  })

  it('passes null for optional fields when omitted', async () => {
    const minimalPayload = {
      foodName: 'Banana',
      calorieAmount: 105,
    }
    const created = { id: 'entry-id', userId, ...minimalPayload }
    CalorieEntry.create.mockResolvedValue(created)

    await CalorieEntryService.create(userId, minimalPayload)

    expect(CalorieEntry.create).toHaveBeenCalledWith({
      userId,
      foodName: 'Banana',
      calorieAmount: 105,
      protein: null,
      carbs: null,
      fat: null,
      quantity: null,
      unit: null,
      mealType: null,
      notes: null,
    })
  })
})
