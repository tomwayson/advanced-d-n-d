/**
 * section-controls/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['section-controls-container'],
  classNameBindings: ['invisible'],
  attributeBindings:['style'],
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  invisible: Ember.computed.not('visible'),
  componentPosition:null,
  sectionComponent:null,
  style:'',

  init(){
    this._super(...arguments);
    this.get('layoutCoordinator').on('showSectionControls', Ember.run.bind(this, this.showSectionControls));
  },
  willDestroyElement(){
    this.get('layoutCoordinator').off('showSectionControls', this.showSectionControls);
  },

  showSectionControls(sectionComponent){
    if(sectionComponent){
      this.set('sectionComponent', sectionComponent);
      this.updateStyle( sectionComponent.get('componentPosition') );
      this.set('invisible', false);
    }else{
      this.updateStyle( null );
      this.set('invisible', true);
    }
  },

  updateStyle(componentPosition){
    let styleString = Ember.String.htmlSafe('');
    let pos = componentPosition;

    if(pos){
      let lf = pos.right - 50;
      let tp = pos.top;
      styleString = Ember.String.htmlSafe('top:' + tp + 'px; left:' + lf + 'px;');
    }
    this.set('style',  styleString);
  },
  mouseEnter() {
    //show the hilight around the current section
    if(this.get('sectionComponent')){
      this.set('sectionComponent.highlight', true);
    }
  },
  mouseLeave() {
    //hide the hilight
    if(this.get('sectionComponent.highlight')){
      this.set('sectionComponent.highlight', false);
    }
  },
  actions: {
    removeSection(){
      this.updateStyle();
      this.sendAction('onRemoveSection', this.get('sectionComponent.model'));
    },
    editSection(){
      this.sendAction('editSection', this.get('sectionComponent.model'));
    }
  }
});
