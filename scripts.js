/*

*/

var board = [[],[],[],[],[],[],[],[]];
var validCardMoveTarget = false; //will either be false or the div the card has moved to.

$(function(){
	//temporary position setup for divs
	pageload();
});

function cardCanBePlacedOn(movingId, placingId){
	movingSuit = Math.floor(movingId/13);
	placingSuit = Math.floor(placingId/13);
	if(movingSuit===0||movingSuit===2){
		if(placingSuit===0||placingSuit===2){
			return false;
		}
	}else{
		if(placingSuit===1||placingSuit===3){
			return false;
		}
	}
	if((movingId%13+1)===(placingId%13)){
		return true;
	}
	return false;
}

function doubleClick(div){
	//if card goes in wintray, move there, otherwise move to first free cell, otherwise, do nothing
	var id = div.attr("id");
	var pips = id%13;
	var suit = Math.floor(id/13);
	if($("#win"+suit).children().length===(pips)){
		moveCardTo(div, $("#win"+suit));
		div.off('dblclick');
		return;
	}
	//test for free cells
	for(var i = 0; i<4; i++){
		if($("#cell"+i).children().length===0){
			moveCardTo(div, $("#cell"+i));
			return;
		}
	}
}

function dragStart(event, ui){
	//console.log(event);
	var movingObject = $(event.target);
	var cardId = movingObject.attr("id");
	movingObject.addClass("topdiv");
	//if card is stacked on another card, show the bottom card
	//console.log(movingObject.parent()[0]);
	//TODO: make function exposeCard: add classes, show images, etc.
	if(!movingObject.parent().hasClass("columntop")){
		exposeCard(movingObject.parent());
	}
	findValidDrops(movingObject);
}

function dragStop(event, ui){
	var card = $(event.target);
	card.removeAttr("style");
	//test if droppableDragDropped fired, meaning card has been moved
	//otherwise return back to original location.
	if(validCardMoveTarget){//change card's parent
		moveCardTo(card, validCardMoveTarget)
		validCardMoveTarget=false;
	}

	if(!card.parent().hasClass("columntop")){//if the card has landed on another card, remove .topdiv
		card.removeClass("topdiv");			 //if the card has landed on a blank column, keep .topdiv
	}

	if(card.parent().hasClass("bottomdiv")){
		hideCard(card.parent());
	}
	
	//move card back to original location
	//or position it properly in new div.
	//card.css({left:0, top:0});
	removeDroppables();
}

function droppableDragDropped(event, ui){
	//set flag stating card has been dropped in a new, valid location
	//dragStop will manage all card moves.
	validCardMoveTarget = $(event.target);
	//the card has been dropped on an approved droppable
	//console.log(validCardMoveTarget);
}

function droppableDragEnded(event, ui){
	//card has been dropped, remove highlighting and listeners
	highlightOff(event.target);
	//$(event.target).droppable("destroy");
}

function droppableDragStarted(event, ui){
	//find all targets for the currently dragged card, highlight them
	highlightOn(event.target);
}

function exposeCard(div){
	//TODO: if exposed card fits on win tray, move it there automatically

	$(div).addClass("bottomdiv");
	makeDraggable($(div));
	var id = div.attr("id");
	var imgElement = div.children("img").first();
	fullCard(imgElement, id);
	$(div).dblclick(function(e){
		e.stopPropagation();
		doubleClick($(this));
	})
}

function findValidDrops(movingObject){
	//when a card starts dragging, find all eligible drop locations and add droppable
	var id = movingObject.attr("id");
	var suit = Math.floor(id/13);
	var pips = (id%13);
	if($("#win"+suit).children().length===(pips)){
		makeDroppable($("#win"+suit));
	}
	for(var i = 0; i<4; i++){
		if($("#cell"+i).children().length===0){
			makeDroppable($("#cell"+i));
		}
	}
	for(var i = 0; i<8;i++){
		//if column empty
		if(!$("#col"+i).children("div")[0]){
			makeDroppable($("#col"+i));
		}

		//if card can be placed on bottom card
		var bottomCardId = idOfBottomCard("#col"+i);
		if(cardCanBePlacedOn(id, bottomCardId)){
			makeDroppable($("#"+bottomCardId));
		}
	}
}

function fullCard(imgElement, cardId){
	var element = $(imgElement);
	element.attr("src", "images/"+idToCard(cardId)+".png");
	return element;
}

function getPips(id){
	var pips = id%13+1;
	switch(pips){
		case 11:
			pips = "j"
			break;
		case 12:
			pips = "q"
			break;
		case 13:
			pips = "k"
			break;
	}
	return pips;
}

function getSuit(id){
	var suit = Math.floor(id/13);
	switch(suit){
		case 0:
			suit = "c"
			break;
		case 1:
			suit = "d"
			break;
		case 2:
			suit = "s"
			break;
		case 3:
			suit = "h"
			break;
	}
	return suit;
}

function halfCard(imgElement, cardId){
	var element = $(imgElement);
	element.attr("src", "images/"+idToCard(cardId)+"h.png");
	return element;
}

function hideCard(div){
	//TODO:remove dragable if not a sequence card

	$(div).removeClass("bottomdiv");
	removeDraggable($(div));
	var id = div.attr("id");
	var imgElement = div.children("img").first();
	halfCard(imgElement, id);
	$(div).off("dblclick");
}

function highlightOff(div){
	$(".highlighted").unwrap().removeClass("highlighted");
}

function highlightOn(div){
	if($(div).children("img").length>0){
		$(div).children("img").first().addClass("highlighted").wrap("<div class='tint'></div>");
		return;
	}
	$(div).addClass("highlighted");
}

function idOfBottomCard(div){
	if($(div).children("div")[0]){
		return idOfBottomCard($(div).children("div")[0]);
	}
	return $(div).attr("id");
}

function idToCard(id){
	return getSuit(id)+getPips(id);
}

function makeDraggable(div){
	div.draggable({
		start: function(event, ui){dragStart(event, ui);},
		stop: function(event, ui){dragStop(event, ui);},
		});
}

function makeDroppable(div){
	div.droppable({
		activate: function(event, ui){droppableDragStarted(event,ui);},
		deactivate: function(event, ui){droppableDragEnded(event,ui);},
		drop: function(event, ui){droppableDragDropped(event,ui);},
		tolerance: "pointer"
		});
	div.addClass("droppable");
}

function moveCardTo(card, div){
	exposeCard(card.parent());
	card.removeAttr("style");
	$(div).append(card);
	card.addClass("topdiv")
	card.css({left:0, top:0});
}

function pageload(){
	placeBaseElements();
	setBoard();
	placeCards();
	exposeCard($('.carddiv'));
}

function placeBaseElements(){
	//setup free cells
	for(var i = 0; i<4; i++){
		var left = (i*100)+"px";
		var top = "0px"
		$("#cell"+i).css({"left":left, "top":top});
	}	
	//setup win tray
	for(var i = 0; i<4; i++){
		var left = 400+(i*100)+"px";
		var top = "0px"
		$("#win"+i).css({"left":left, "top":top});
	}	

	//setup main columns
	for(var i = 0; i<8; i++){
		var left = (i*100)+"px";
		var top = "150px"
		$("#col"+i).css({"left":left, "top":top});
	}
}

function placeCards(){
	var parent;
	for(var i=0; i<8;i++){
		parent=$("#col"+i);
		for(var j=0; j<board[i].length;j++){
			var cardId = board[i][j];
			var cardDiv = $("<div></div>").attr("id",cardId);
			var img;
			if(j===(board[i].length-1)){
				cardDiv.addClass("carddiv");
				img = fullCard("<img>", cardId);

			}else{
				img = halfCard("<img>", cardId);
			}
			cardDiv.append(img);
			parent.append(cardDiv);
			parent = parent.children("div").first();
		}
	}
}

function setBoard(){
	var deck = shuffleDeck();
	for(var i=0; i<52;i++){
		board[i%8].push(deck[i]);
	}
}

function shuffleDeck(){
	var newdeck = [];
	var deck = [];
	for(var i=0; i<52; i++){
		newdeck.push(i);
	}
	while(newdeck.length>0){
		var index = Math.floor(Math.random()*newdeck.length);
		deck.push(newdeck.splice(index, 1)[0]);
	}
	return deck;
}

function removeDraggable(div){
	if(div.data("draggable")){
		div.draggable("destroy").removeClass("carddiv");
	}
}

function removeDroppables(){
	$(".droppable").droppable("destroy").removeClass("droppable");
}