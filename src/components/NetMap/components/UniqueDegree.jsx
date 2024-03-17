import React from 'react'

const UniqueDegree = (centrality_measures) => {

    // Extract unique degrees using a Set
  const uniqueDegrees = new Set(centrality_measures.map(entry => entry.degree));

  // Create a new array with unique degree entries
  const uniqueDegreesArray = Array.from(uniqueDegrees).map(degree => ({ degree }));

  // Convert the array to JSON format
  const uniqueDegreesJSON = JSON.stringify(uniqueDegreesArray, null, 2);


  return (
    uniqueDegreesJSON
  )
}

export default UniqueDegree