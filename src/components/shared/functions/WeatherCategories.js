import weather_categories from "../../../static/data/weather_categories.json"

export const getCategoryName = (category, lang="en") => {
    const categoryInfo = weather_categories.find(e => e.category === category)
    return categoryInfo[lang]
}

export const getIntensityName = (category, intensity, lang="en") => {
    const categoryInfo = weather_categories.find(e => e.category === category)
    const intensityInfo = categoryInfo.intensity.find(e => e.name === intensity)
    return intensityInfo[lang]
}

export const getIntensityValue = (category, intensity) => {
    const categoryInfo = weather_categories.find(e => e.category === category)
    const intensityInfo = categoryInfo.intensity.find(e => e.name === intensity)
    return intensityInfo.value
}
