import { ELEMENT_UNIT } from '../types'

export const getElementUnit = (element: string): string => {
	if (element.startsWith('R')) return ELEMENT_UNIT.resistor
	if (element.startsWith('C')) return ELEMENT_UNIT.capacitor
	if (element.startsWith('L')) return ELEMENT_UNIT.inductor
	if (element.startsWith('V')) return ELEMENT_UNIT.voltage
	if (element.startsWith('I')) return ELEMENT_UNIT.current
	if (element.startsWith('SW')) return ELEMENT_UNIT.wire
	else return ELEMENT_UNIT.wire
}
