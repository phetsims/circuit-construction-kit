// Copyright 2015-2016, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ExploreScreen = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/explore/ExploreScreen' );
  var BlackBoxScreen = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/BlackBoxScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var circuitConstructionKitBasicsTitleString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_BASICS/circuit-construction-kit-basics.title' );

  var simOptions = {
    credits: {
      leadDesign: 'Amy Rouinfar',
      softwareDevelopment: 'Sam Reid',
      team: 'Michael Dubson, Ariel Paul, Kathy Perkins',
      qualityAssurance: '',
      graphicArts: 'Bryce Gruneich'
    }
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( phet.chipper.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  // Circuit Construction Kit: Basics has unit tests for checking the mathematics for the Modified Nodal Analysis
  // algorithm.  In order to load the classes into an accessible namespace, the *-config.js and *-main.js are loaded
  // however, when running the unit tests we don't also want to launch the simulation.
  if ( !window.circuitConstructionKitBasicsTestSuite ) {
    SimLauncher.launch( function() {
      var sim = new Sim( circuitConstructionKitBasicsTitleString, [
        new ExploreScreen(),
        new BlackBoxScreen()
      ], simOptions );
      sim.start();
    } );
  }
} );