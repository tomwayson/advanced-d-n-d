/**
 * card-drag-control/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'span',
  classNames:['layout-control', 'pull-left'],
  cardComponent:null,
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  
  mouseDown(event){
    this.get('layoutCoordinator').checkDrag(event, this.get('cardComponent'));
  }
});
