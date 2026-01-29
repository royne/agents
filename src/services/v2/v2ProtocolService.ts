import { ProductData } from '../../types/image-pro';

export class V2ProtocolService {
  /**
   * Applies a delta (partial update with flags) to the product data.
   * This ensures only explicitly modified fields by the AI/User are updated.
   */
  static applyDelta(currentDNA: ProductData, delta: any): ProductData {
    if (!delta) return currentDNA;

    const newDNA = { ...currentDNA };
    let hasChanges = false;

    // We iterate over the delta keys and check the 'updated' flag
    const fields = ['name', 'angle', 'buyer', 'details'] as const;

    fields.forEach(field => {
      if (delta[field] && delta[field].updated === true) {
        console.log(`[V2ProtocolService] Updating field: ${field}`);
        newDNA[field] = delta[field].value;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      console.log('[V2ProtocolService] DNA updated successfully.');
    } else {
      console.log('[V2ProtocolService] No changes detected in delta.');
    }

    return newDNA;
  }
}
