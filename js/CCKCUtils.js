// Copyright 2017-2021, University of Colorado Boulder

/**
 * Static utilities for the Circuit Construction Kit: DC simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../dot/js/Utils.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import circuitConstructionKitCommonStrings from './circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from './circuitConstructionKitCommon.js';

const currentUnitsString = circuitConstructionKitCommonStrings.currentUnits;
const voltageUnitsString = circuitConstructionKitCommonStrings.voltageUnits;

const CCKCUtils = {

  /**
   * Typically show 2 decimal places for current and voltage readouts in the play area, but if it is a smaller value,
   * below 0.02 and 0.001, then it should show 3 decimal places.
   * @public
   * @param {number} value - the value to be formatted for display
   * @returns {number} - the number of decimal places to use for the display
   */
  getNumberOfDecimalPoints: function( value ) {
    const abs = Math.abs( value );
    return ( abs >= 0 && abs < 0.02 ) ? 3 : 2;
  },

  /**
   * Returns a string that adjusts its ampere value.
   * @param {number} current - number of Amps
   * @returns {string}
   * @public
   */
  createCurrentReadout: function( current ) {
    const absoluteCurrent = Math.abs( current );
    const decimals = this.getNumberOfDecimalPoints( absoluteCurrent );

    // Show 3 decimal places so that current can still be seen with a glowing high-resistance bulb
    return StringUtils.fillIn( currentUnitsString, { current: Utils.toFixed( absoluteCurrent, decimals ) } );
  },

  /**
   * Returns a string that adjusts its voltage value.
   * @param {number} value - voltage value in Volts
   * @returns {string}
   * @public
   */
  createVoltageReadout: function( value ) {
    const decimals = this.getNumberOfDecimalPoints( value );

    return StringUtils.fillIn( voltageUnitsString, { voltage: Utils.toFixed( value, decimals ) } );
  },

  /**
   * Checks whether a child should be in the scene graph and adds/removes it as necessary.  This is to improve
   * performance so that the DOM only contains displayed items and doesn't try to update invisible ones.
   * @param {boolean} inSceneGraph - should the child be shown in the scene graph
   * @param {Node} parent - parent that contains the child in the scene graph
   * @param {Node} child - child added/removed from scene graph
   * @public
   */
  setInSceneGraph: function( inSceneGraph, parent, child ) {
    if ( inSceneGraph && !parent.hasChild( child ) ) {
      parent.addChild( child );
    }
    else if ( !inSceneGraph && parent.hasChild( child ) ) {
      parent.removeChild( child );
    }
  }
};

circuitConstructionKitCommon.register( 'CCKCUtils', CCKCUtils );
export default CCKCUtils;