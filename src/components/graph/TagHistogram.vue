<template>
  <div class="histo">
    <div class="header-bar">
      <h2>Histogramme</h2>
      <button class="reset-btn" @click="reset">Reset</button>
    </div>

    <section class="picker">
      <h3>Périodes</h3>
      <div class="chips">
        <button
          v-for="p in availablePeriods"
          :key="p.id"
          class="chip"
          :class="{ active: selectedPeriodIds.includes(p.id!) }"
          @click="togglePeriod(p.id!)"
        >{{ p.title }}</button>
      </div>
    </section>

    <section class="picker">
      <h3>Nouvelle combinaison de tags</h3>
      <div class="chips">
        <button
          v-for="t in availableTags"
          :key="t.id"
          class="chip"
          :class="{ active: draftTagIds.includes(t.id!) }"
          @click="toggleDraftTag(t.id!)"
        >
          <img v-if="t.icon" class="chip-icon" :src="`${uploadsUrl}/${t.icon}`" />
          {{ t.title }}
        </button>
      </div>
      <button class="add-combo" :disabled="!draftTagIds.length" @click="addCombo">Ajouter la combinaison</button>
    </section>

    <section class="picker">
      <h3>Devise</h3>
      <select v-model="targetCurrencyCode" class="currency-select">
        <option v-for="c in currencyOptions" :key="c" :value="c">{{ c }}</option>
      </select>
    </section>

    <div v-if="combos.length" class="legend">
      <span v-for="(combo, index) in combos" :key="comboKey(combo)" class="legend-item">
        <span class="legend-color" :style="{ background: comboColor(index) }"></span>
        <template v-for="(t, i) in comboTags(combo)" :key="t.id">
          <span v-if="i > 0" class="legend-plus">+</span>
          <img v-if="t.icon" class="legend-icon" :src="`${uploadsUrl}/${t.icon}`" />
          {{ t.title }}
        </template>
        <button class="remove-combo" aria-label="Retirer" @click="removeCombo(index)">×</button>
      </span>
    </div>

    <p v-if="!selectedPeriods.length || !combos.length" class="empty">
      Sélectionnez au moins une période et ajoutez une combinaison de tags
    </p>

    <div v-else class="chart-scroll">
      <!-- Grille à 2 lignes : barres (alignées en bas) puis libellés ; une colonne par période -->
      <div class="chart">
        <template v-for="p in selectedPeriods" :key="p.id">
          <div class="bars">
            <div v-for="(combo, index) in combos" :key="comboKey(combo)" class="bar-col">
              <span class="bar-amount">{{ displayAmount(p.id!, combo) }}</span>
              <div
                class="bar"
                :class="{ positive: (amountOf(p.id!, combo) ?? 0) > 0 }"
                :style="{ height: barHeight(p.id!, combo), background: comboColor(index) }"
                :title="`${comboLabel(combo)} — ${displayAmount(p.id!, combo)}`"
              ></div>
            </div>
          </div>
          <div class="group-label">{{ p.title }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  compute,
  getPeriods,
  getTags,
  type ComputationRequestDto,
  type PeriodDto,
  type TagDto,
} from '@/api/generated'
import { absoluteAmount, formatAmount } from '@/utils/formatAmount'

const uploadsUrl = import.meta.env.VITE_UPLOADS_URL

const STORAGE_KEY = 'tagHistogram'
const BAR_MAX_HEIGHT = 200
const PALETTE = ['#57afea', '#e67e22', '#27ae60', '#9b59b6', '#e74c3c', '#f1c40f', '#1abc9c', '#34495e', '#d35400', '#7f8c8d']

const periods = ref<PeriodDto[]>([])
const tags = ref<TagDto[]>([])
const selectedPeriodIds = ref<number[]>([])
// Chaque combinaison est une liste d'ids de tags (triée) = une barre par période
const combos = ref<number[][]>([])
// Combinaison en cours de construction
const draftTagIds = ref<number[]>([])
const targetCurrencyCode = ref<string>('CHF')
// Montants indexés par `${periodId}|${comboKey}`
const amounts = ref<Record<string, number | undefined>>({})

const availablePeriods = computed(() => periods.value.filter((p) => !p.hidden))
const availableTags = computed(() => tags.value.filter((t) => !t.hidden))

// L'ordre d'affichage des périodes suit celui de la liste chargée (pas l'ordre de sélection)
const selectedPeriods = computed(() => periods.value.filter((p) => selectedPeriodIds.value.includes(p.id!)))

const currencyOptions = computed(() => {
  const codes = new Set<string>(['CHF'])
  tags.value.forEach((t) => t.currencyCode && codes.add(t.currencyCode))
  return [...codes].sort()
})

const comboKey = (combo: number[]) => combo.join('+')
const comboTags = (combo: number[]) =>
  combo.map((id) => tags.value.find((t) => t.id === id)).filter((t): t is TagDto => !!t)
const comboLabel = (combo: number[]) => comboTags(combo).map((t) => t.title).join(' + ')
const comboColor = (index: number) => PALETTE[index % PALETTE.length]

const key = (periodId: number, combo: number[]) => `${periodId}|${comboKey(combo)}`
const amountOf = (periodId: number, combo: number[]) => amounts.value[key(periodId, combo)]

const displayAmount = (periodId: number, combo: number[]) => {
  const amount = amountOf(periodId, combo)
  return amount === undefined ? '…' : formatAmount(absoluteAmount(amount), targetCurrencyCode.value)
}

const maxAmount = computed(() => {
  let max = 0
  for (const p of selectedPeriods.value)
    for (const combo of combos.value)
      max = Math.max(max, absoluteAmount(amountOf(p.id!, combo)))
  return max
})

const barHeight = (periodId: number, combo: number[]) => {
  if (!maxAmount.value) return '0px'
  const height = (absoluteAmount(amountOf(periodId, combo)) / maxAmount.value) * BAR_MAX_HEIGHT
  return `${Math.max(height, 1)}px`
}

const toggle = (list: number[], id: number) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id]

const togglePeriod = (id: number) => (selectedPeriodIds.value = toggle(selectedPeriodIds.value, id))
const toggleDraftTag = (id: number) => (draftTagIds.value = toggle(draftTagIds.value, id))

const addCombo = () => {
  const combo = [...draftTagIds.value].sort((a, b) => a - b)
  if (combo.length && !combos.value.some((c) => comboKey(c) === comboKey(combo)))
    combos.value = [...combos.value, combo]
  draftTagIds.value = []
}

const removeCombo = (index: number) => (combos.value = combos.value.filter((_, i) => i !== index))

const reset = () => {
  selectedPeriodIds.value = []
  combos.value = []
  draftTagIds.value = []
  targetCurrencyCode.value = 'CHF'
  amounts.value = {}
}

// --- localStorage ---
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    selectedPeriodIds.value = Array.isArray(saved.periodIds) ? saved.periodIds : []
    combos.value = Array.isArray(saved.combos) ? saved.combos.filter(Array.isArray) : []
    if (typeof saved.currency === 'string') targetCurrencyCode.value = saved.currency
  } catch {
    // stockage illisible : on repart de zéro
  }
}

watch([selectedPeriodIds, combos, targetCurrencyCode], () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        periodIds: selectedPeriodIds.value,
        combos: combos.value,
        currency: targetCurrencyCode.value,
      }),
    )
  } catch {
    // stockage indisponible
  }
})

// --- Calcul ---
// Un appel `compute` par couple (période, combinaison) ; les couples déjà connus ne sont pas recalculés
const fetchAmount = async (period: PeriodDto, combo: number[], currency: string) => {
  const request: ComputationRequestDto = {
    startDate: period.startDate,
    endDate: period.endDate,
    tags: comboTags(combo),
    excludedTags: [],
    searchText: '',
    targetCurrencyCode: currency,
  }
  const response = await compute(request)
  // Ignore la réponse si la devise a changé entre-temps
  if (response.status === 200 && currency === targetCurrencyCode.value)
    amounts.value[key(period.id!, combo)] = response.data.totalAmount ?? 0
}

const fetchMissingAmounts = () => {
  // Les tags doivent être chargés pour construire les requêtes
  if (!tags.value.length) return
  for (const p of selectedPeriods.value)
    for (const combo of combos.value)
      if (!(key(p.id!, combo) in amounts.value)) {
        amounts.value[key(p.id!, combo)] = undefined
        fetchAmount(p, combo, targetCurrencyCode.value)
      }
}

watch([selectedPeriods, combos, tags], fetchMissingAmounts)

watch(targetCurrencyCode, () => {
  amounts.value = {}
  fetchMissingAmounts()
})

onMounted(async () => {
  loadFromStorage()
  const [periodsResponse, tagsResponse] = await Promise.all([
    getPeriods({ size: 1000, sort: ['startDate:desc'] }),
    getTags({ size: 1000, sort: ['sortingOrder:asc'] }),
  ])
  periods.value = (periodsResponse.data.content as PeriodDto[]) || []
  // Retire de la sélection les éléments qui n'existent plus (avant de charger les tags, pour ne pas lancer de calcul inutile)
  selectedPeriodIds.value = selectedPeriodIds.value.filter((id) => periods.value.some((p) => p.id === id))
  const loadedTags = (tagsResponse.data.content as TagDto[]) || []
  combos.value = combos.value
    .map((combo) => combo.filter((id) => loadedTags.some((t) => t.id === id)))
    .filter((combo) => combo.length)
  tags.value = loadedTags
})
</script>

<style scoped>
.histo {
  padding: 0.5rem;
}
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
h2 {
  margin: 0;
}
.reset-btn {
  padding: 0.3rem 0.8rem;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  background: #ecf0f1;
  color: #2c3e50;
  font-size: 0.8rem;
  cursor: pointer;
}
.reset-btn:hover {
  background: #dfe4e6;
}
h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.4rem;
  color: #2c3e50;
}
.picker {
  margin-bottom: 1rem;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.6rem;
  border: 1px solid #e1e8ed;
  border-radius: 999px;
  background: #fff;
  color: #2c3e50;
  font-size: 0.8rem;
  cursor: pointer;
}
.chip.active {
  background: #57afea;
  border-color: #57afea;
  color: #fff;
}
.chip-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}
.add-combo {
  margin-top: 0.5rem;
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 6px;
  background: #57afea;
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
}
.add-combo:disabled {
  background: #bdc3c7;
  cursor: default;
}
.currency-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
}
.empty {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.2rem 0.15rem 0.4rem;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
}
.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
.legend-plus {
  color: #7f8c8d;
}
.legend-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
.remove-combo {
  border: none;
  background: none;
  color: #7f8c8d;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.2rem;
}
.chart-scroll {
  overflow-x: auto;
  padding-bottom: 0.5rem;
}
.chart {
  display: grid;
  grid-template-rows: auto auto;
  grid-auto-flow: column;
  column-gap: 1.5rem;
  width: max-content;
  padding-top: 1.5rem;
}
.bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  align-self: end;
  gap: 0.25rem;
  padding: 0 0.25rem;
  border-bottom: 1px solid #bdc3c7;
}
.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}
.bar-amount {
  font-size: 0.65rem;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  margin-bottom: 0.2rem;
}
.bar {
  width: 28px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}
.bar.positive {
  outline: 2px dashed #27ae60;
  outline-offset: -2px;
}
.group-label {
  align-self: start;
  justify-self: center;
  margin-top: 0.3rem;
  font-size: 0.75rem;
  color: #2c3e50;
  text-align: center;
  max-width: 10rem;
}
</style>
