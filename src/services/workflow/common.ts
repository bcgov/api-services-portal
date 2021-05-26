export const isRequested = (existingItem: any, updatedItem: any) => existingItem == null
export const isUpdatingToApproved = (existingItem: any, updatedItem: any) => existingItem && (existingItem.isApproved == null || existingItem.isApproved == false) && updatedItem.isApproved
export const isUpdatingToIssued = (existingItem: any, updatedItem: any) => 
                    existingItem && 
                    (existingItem.isIssued == null || existingItem.isIssued == false) && 
                    (existingItem.isComplete == null || existingItem.isComplete == false) &&
                    updatedItem.isIssued
export const isUpdatingToRejected = (existingItem: any, updatedItem: any) => existingItem && (existingItem.isComplete == null || existingItem.isComplete == false) && updatedItem.isComplete && updatedItem.isApproved == false

export const isBlank = ((val:any) => val == null || typeof(val) == 'undefined' || val == "")
