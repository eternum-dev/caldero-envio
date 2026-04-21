import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useStore } from '../contexts/StoreContext'
import { ROUTES } from '../utils/constants'
import OnboardingLayout from '../templates/OnboardingLayout'
import FormField from '../molecules/FormField'
import Button from '../atoms/Button'
import Icon from '../atoms/Icon'

const STEPS = [
  { id: 1, name: 'Tu Local', description: 'Datos del negocio' },
  { id: 2, name: 'Repartidores', description: 'Agrega tu equipo' },
  { id: 3, name: 'Tarifas', description: 'Configura precios' },
  { id: 4, name: 'Listo', description: 'Comenzar' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { saveStore, addCourier, savePricingRules } = useStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [storeData, setStoreData] = useState({
    name: '',
    phone: '',
    address: '',
    lat: '',
    lng: '',
  })

  const [couriers, setCouriers] = useState([])
  const [newCourier, setNewCourier] = useState({ name: '', phone: '' })

  const [pricingRules, setPricingRules] = useState([
    { minKm: 0, maxKm: 3, price: 500 },
    { minKm: 3, maxKm: 5, price: 700 },
    { minKm: 5, maxKm: 10, price: 1000 },
    { minKm: 10, maxKm: null, price: 1500 },
  ])

  const handleAddCourier = () => {
    if (!newCourier.name.trim() || !newCourier.phone.trim()) return
    setCouriers([...couriers, { ...newCourier, id: Date.now().toString() }])
    setNewCourier({ name: '', phone: '' })
  }

  const handleRemoveCourier = (id) => {
    setCouriers(couriers.filter((c) => c.id !== id))
  }

  const handlePricingChange = (index, field, value) => {
    const updated = [...pricingRules]
    updated[index] = { ...updated[index], [field]: value }
    setPricingRules(updated)
  }

  const handleAddPricingRule = () => {
    setPricingRules([
      ...pricingRules,
      { minKm: 0, maxKm: null, price: 0 },
    ])
  }

  const handleRemovePricingRule = (index) => {
    setPricingRules(pricingRules.filter((_, i) => i !== index))
  }

  const handleNext = async () => {
    setError('')

    if (currentStep === 1) {
      if (!storeData.name || !storeData.address || !storeData.lat || !storeData.lng) {
        setError('Completa todos los campos')
        return
      }
    }

    if (currentStep === 2 && couriers.length === 0) {
      setError('Agrega al menos un repartidor')
      return
    }

    if (currentStep === 3) {
      setLoading(true)
      try {
        await saveStore({
          name: storeData.name,
          phone: storeData.phone,
          address: storeData.address,
          originCoordinates: { lat: parseFloat(storeData.lat), lng: parseFloat(storeData.lng) },
        })

        for (const courier of couriers) {
          await addCourier(courier)
        }

        await savePricingRules(pricingRules)

        await updateUser({ hasCompletedOnboarding: true })

        navigate(ROUTES.APP)
        return
      } catch (err) {
        setError('Error al guardar. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
      return
    }

    setCurrentStep(currentStep + 1)
  }

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={STEPS.length}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {STEPS[currentStep - 1].name}
        </h2>
        <p className="text-gray-600">
          {STEPS[currentStep - 1].description}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-4">
          <FormField
            label="Nombre del local"
            value={storeData.name}
            onChange={(e) => setStoreData({ ...storeData, name: e.target.value })}
            placeholder="Pizzería Don Luigi"
            required
          />

          <FormField
            label="Teléfono de contacto"
            type="tel"
            value={storeData.phone}
            onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
            placeholder="+54 11 1234-5678"
            required
          />

          <FormField
            label="Dirección"
            value={storeData.address}
            onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
            placeholder="Av. Corrientes 1234, Buenos Aires"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Latitud"
              type="number"
              step="any"
              value={storeData.lat}
              onChange={(e) => setStoreData({ ...storeData, lat: e.target.value })}
              placeholder="-34.6037"
              required
            />
            <FormField
              label="Longitud"
              type="number"
              step="any"
              value={storeData.lng}
              onChange={(e) => setStoreData({ ...storeData, lng: e.target.value })}
              placeholder="-58.3816"
              required
            />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Agrega los repartidores que realizarán entregas.
          </p>

          <div className="flex gap-2">
            <FormField
              label="Nombre"
              value={newCourier.name}
              onChange={(e) => setNewCourier({ ...newCourier, name: e.target.value })}
              placeholder="Juan Pérez"
              className="flex-1"
            />
            <FormField
              label="Teléfono"
              value={newCourier.phone}
              onChange={(e) => setNewCourier({ ...newCourier, phone: e.target.value })}
              placeholder="+54 11 9876-5432"
              className="flex-1"
            />
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCourier}
              >
                <Icon name="plus" className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {couriers.map((courier) => (
              <div
                key={courier.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{courier.name}</p>
                  <p className="text-sm text-gray-600">{courier.phone}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCourier(courier.id)}
                >
                  <Icon name="x" className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Configura las tarifas según distancia. El precio se aplica al rango correspondiente.
          </p>

          <div className="space-y-3">
            {pricingRules.map((rule, index) => (
              <div key={index} className="flex gap-2 items-end">
                <FormField
                  label="Desde (km)"
                  type="number"
                  step="0.1"
                  value={rule.minKm}
                  onChange={(e) => handlePricingChange(index, 'minKm', parseFloat(e.target.value))}
                  className="w-24"
                />
                <FormField
                  label="Hasta (km)"
                  type="number"
                  step="0.1"
                  value={rule.maxKm || ''}
                  onChange={(e) => handlePricingChange(index, 'maxKm', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="∞"
                  className="w-24"
                />
                <FormField
                  label="Precio ($)"
                  type="number"
                  value={rule.price}
                  onChange={(e) => handlePricingChange(index, 'price', parseFloat(e.target.value))}
                  className="w-32"
                />
                {pricingRules.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePricingRule(index)}
                  >
                    <Icon name="x" className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={handleAddPricingRule}
            className="mt-2"
          >
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Agregar regla
          </Button>
        </div>
      )}

      {currentStep === 4 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="check" className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Todo listo!
          </h3>
          <p className="text-gray-600 mb-6">
            Tu local está configurado. Ya puedes comenzar a calcular envíos.
          </p>
        </div>
      )}

      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <Icon name="chevronLeft" className="w-5 h-5 mr-2" />
            Anterior
          </Button>
        ) : (
          <div />
        )}

        <Button
          type="button"
          variant="primary"
          onClick={handleNext}
          loading={loading}
        >
          {currentStep === STEPS.length ? 'Comenzar' : 'Siguiente'}
          <Icon name="chevronRight" className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </OnboardingLayout>
  )
}