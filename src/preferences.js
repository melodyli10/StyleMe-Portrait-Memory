// Only this allowlisted numerical record may cross the persistence boundary.
export const PREFERENCE_KEY = 'styleme.preferences.v1'
export function preferenceValues(value) {
  if(!value || !['eye','face'].every(key=>typeof value[key]==='number' && Number.isInteger(value[key]) && value[key]>=0 && value[key]<=100)) {
    throw new Error('Preferences must contain eye and face integers from 0 to 100.')
  }
  return {version:1,eye:value.eye,face:value.face}
}

// Storage is injected so the module can be reused without the browser/DOM.
export function createPreferenceStore(getStorage) {
  return {
    load() {
      const raw=getStorage().getItem(PREFERENCE_KEY)
      if(raw===null)return null
      const value=JSON.parse(raw)
      if(value?.version!==1)throw new Error('Unsupported preference version.')
      return preferenceValues(value)
    },
    save(value) {
      const record=preferenceValues(value)
      getStorage().setItem(PREFERENCE_KEY,JSON.stringify(record))
      return record
    },
    clear() { getStorage().removeItem(PREFERENCE_KEY) },
  }
}
