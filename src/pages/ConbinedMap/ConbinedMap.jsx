import React from 'react'
import NetMap from '../NetworkMap/index'
// import NetMapTest from '../../components/NetMapTest/index'
import HeatMap from '../HeatMap/index'
import HistogramMap from '../HistogramMap/index'
import TableOfDetails from '../../components/TableOfContent/index'

// import NewNetMap from '../../components/NewNetMap/index'

const ConbinedMap = () => {

    return (
        <>
        <div className='all-cell-parent' style={{ width: '1024px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: '' }}>
        <h1 className='dashboard-header'>Citizen weather dashboard</h1>
            <div style={{ display: 'flex', justifyContent: 'start' }}>
                <HeatMap />
                <NetMap />
                {/* <NewNetMap className={"hierarchicalEdgeBundling-networkMap"} width={300} height={280} /> */}
            </div>
            <div style={{ display: 'flex', justifyContent: 'start' }}>
                <HistogramMap />
                <TableOfDetails />
            </div>
        </div>
         </>
    )
}

export default ConbinedMap