import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'section',
  classNames:['layout-section'],
  containerClass: Ember.computed('model.containment', function(){
    let containment = this.get('model.containment');
    return ( containment === 'fixed') ? 'container' : 'container-fluid';
  }),
  /**
   * The Style will actually be computed from a hash
   * but this is a short-cut to focus on other things
   */
  attributeBindings: ['style'],
  style: Ember.computed('model.style', function(){
    return Ember.String.htmlSafe(this.get('model.style'));
  }),
  /**
   * Get the event bus
   */
  layoutCoordinator: Ember.inject.service('layout-coordinator'),

});
