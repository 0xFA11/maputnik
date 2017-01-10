import React from 'react'
import style from '../../libs/style.js'

class OpenLayers3Map extends React.Component {
  static propTypes = {
    onDataChange: React.PropTypes.func,
    mapStyle: React.PropTypes.object.isRequired,
    accessToken: React.PropTypes.string,
  }

  static defaultProps = {
    onMapLoaded: () => {},
    onDataChange: () => {},
  }

  componentWillReceiveProps(nextProps) {
    require.ensure(["openlayers", "ol-mapbox-style"], ()=> {
      const ol = require('openlayers')
      const olms = require('ol-mapbox-style')
      const jsonStyle = nextProps.mapStyle
      const styleFunc = olms.getStyleFunction(jsonStyle, 'openmaptiles', this.resolutions)

      const layer = this.layer
      layer.setStyle(styleFunc)
      //NOTE: We need to mark the source as changed in order
      //to trigger a rerender
      layer.getSource().changed()

      this.state.map.render()
    })
  }

  componentDidMount() {
    //Load OpenLayers dynamically once we need it
    //TODO: Make this more convenient
    require.ensure(["openlayers", "ol-mapbox-style"], ()=> {
      console.log('Loaded OpenLayers3 renderer')

      const ol = require('openlayers')
      const olms = require('ol-mapbox-style')

      const tilegrid = ol.tilegrid.createXYZ({tileSize: 512, maxZoom: 22})
      this.resolutions = tilegrid.getResolutions()
      this.layer = new ol.layer.VectorTile({
        source: new ol.source.VectorTile({
          attributions: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
          format: new ol.format.MVT(),
          tileGrid: tilegrid,
          tilePixelRatio: 8,
          url: 'https://free-0.tilehosting.com/data/v3/{z}/{x}/{y}.pbf?key=tXiQqN3lIgskyDErJCeY'
        })
      })

      const jsonStyle = this.props.mapStyle
      const styleFunc = olms.getStyleFunction(jsonStyle, 'openmaptiles', this.resolutions)
      this.layer.setStyle(styleFunc)

      const map = new ol.Map({
        target: this.container,
        layers: [this.layer],
        view: new ol.View({
          center: jsonStyle.center,
          zoom: 2,
          //zoom: jsonStyle.zoom,
        })
      })
      map.addControl(new ol.control.Zoom());
      this.setState({ map });
    })
  }

  render() {
    return <div
    ref={x => this.container = x}
    style={{
      position: "fixed",
      top: 0,
      bottom: 0,
      height: "100%",
      width: "100%",
    }}></div>
  }
}

export default OpenLayers3Map
