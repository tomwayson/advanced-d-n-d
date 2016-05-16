/**
 * card-resizer/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['card-resizer'],
  classNameBindings:['isVisible:visible'],
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  attributeBindings:['style'],

  visible:false,
  position : null,
  showRightSizer: false,
  showLeftSizer: false,
  edge: '',
  targetCardModel:null,
  impactedNeighbor:null,

  init(){
    this._super(...arguments);
    this.get('layoutCoordinator').on('showCardResizer', Ember.run.bind(this, this.showCardResizer));

  },
  willDestroyElement(){
    this.get('layoutCoordinator').off('showCardResizer', this.showCardResizer);
  },

  showCardResizer(options){
    if(options){
      //we use an object to se can just call this.setProperties all at once
      //after we've gatheredd all the info we need.
      let m = {
        visible:false,
        position : null,
        showRightSizer: false,
        showLeftSizer: false,
        impactedNeighborModel:null,
        targetCardModel:null,
        edge: options.edge
      };
      let cardPosition = options.component.get('componentPosition');
      let center = {
        top: cardPosition.top + (cardPosition.height / 2),
        left: cardPosition.left + (cardPosition.width / 2)
      };
      //get the targetRow...
      let rowComponent = this.get('layoutCoordinator').getComponentAtPosition('row',center);
      if(rowComponent){
        let cardCount = rowComponent.get('model.cards.length');
        if(cardCount > 1){
          let cardIdx = rowComponent.get('model.cards').indexOf(options.component.get('model'));

          //if it's not (first card, left edge ||  last card, right edge) we can show something
          if( !(cardIdx === 0 && options.edge === 'left') || (cardIdx === (cardCount -1) && options.edge === 'right') ){
            let neighborIndex = ( options.edge === 'right' ) ? cardIdx + 1 : cardIdx -1;
            let impactedNeighborModel = rowComponent.get('model.cards').objectAt(neighborIndex);
            let showLeftSizer = false;
            let showRightSizer = false;

            if(impactedNeighborModel.width > 1){
              //we can show the edgeSide
              if(options.edge === 'right'){
                showRightSizer = true;
              }else{
                showLeftSizer= true;
              }
            }
            if(options.component.get('model.width') > 1){
              //we can show the non-edgeside
              if(options.edge === 'right'){
                showLeftSizer = true;
              }else{
                showRightSizer= true;
              }
            }

            let leftPos = cardPosition[options.edge];
            //update the hash that we will apply to this component
            m = {
              position : {
                "top":cardPosition.top + 10,
                "bottom":cardPosition.bottom - 10,
                "left":leftPos - 9,
                "height":cardPosition.height - 20,
              },
              visible:true,
              showRightSizer: showRightSizer,
              showLeftSizer: showLeftSizer,
              impactedNeighborModel:impactedNeighborModel,
              targetCardModel: options.component.get('model'),
              cardIndex: cardIdx,
              edge: options.edge
            };
          }
        }

      }else{
        console.log('card-resizer could not get targetRow...');
      }
      this.setProperties(m);


    }else{
      this.set('visible',false);
    }
  },

  isVisible: Ember.computed('visible', function(){
    return this.get('visible');
  }),

  style:Ember.computed('position', function(){
    let styleString = '';
    let pos = this.get('position');
    if(pos){
      let ht = pos.height - 100;
      let tp = pos.top + 50;
      styleString = 'top:' + tp + 'px; height:' + ht + 'px;left:' + pos.left + 'px;';
    }
    return Ember.String.htmlSafe(styleString);
  }),

  controlContainerStyle: Ember.computed('position', function(){
    let styleString = '';
    let pos = this.get('position');
    if(pos){
      let tp = ((pos.height - 100) / 2) - 14;
      styleString = 'top:' + tp + 'px;';
    }
    return Ember.String.htmlSafe(styleString);
  }),

  shiftEdge(edge, direction){
    let rightCard, leftCard;
    if(edge==="right"){
      leftCard  = this.get('targetCardModel');
      rightCard = this.get('impactedNeighborModel');
    }else{
      rightCard =this.get('targetCardModel');
      leftCard = this.get('impactedNeighborModel');
    }
    if(direction ==='right'){
      Ember.set(rightCard, 'width', rightCard.width - 1);
      Ember.set(leftCard, 'width', leftCard.width + 1);
    }else{
      Ember.set(leftCard, 'width', leftCard.width - 1);
      Ember.set(rightCard, 'width', rightCard.width + 1);
    }
    //clear out the properties driving it all
    this.setProperties({
      visible:false,
      position : null,
      showRightSizer: false,
      showLeftSizer: false,
      edge: '',
      targetCardModel:null,
      impactedNeighbor:null
    });
  },

  actions: {
    shiftRight(){
      this.set('visible', false);
      this.shiftEdge( this.get('edge'),'right' );
    },
    shiftLeft(){
      this.set('visible', false);
      this.shiftEdge( this.get('edge'),'left' );
    }

  }



});
