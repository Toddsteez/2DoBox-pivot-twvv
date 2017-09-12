//setting focus in title input, retrieve local storage
$(document).ready(function() {
	$('.title-input').focus();
	getStoredCards();
});

//constructor function and prototypes
var TaskCard = function(title, task, id = Date.now(), quality = 0) {
	this.title = title;
	this.task = task;
	this.id = id; 
	this.quality = quality;
	this.complete = false;
};

//connects the quailty index to the string in that index
TaskCard.prototype.qualityString = function() {
	var qualityArray = ['swill', 'plausible', 'genius'];
	return qualityArray[this.quality]; //this = TaskCard
};

//increments the quality value
TaskCard.prototype.qualityIncrement = function() { 
	if (this.quality < 2) {
		this.quality++;
	}
};

//decrements the quality value
TaskCard.prototype.qualityDecrement = function() {
	if (this.quality > 0) {
		this.quality--;
	}
};

//checks for matches in title, body and quality in the search input
TaskCard.prototype.doYouMatch = function(searchTerm) {
	if (this.title.toUpperCase().includes(searchTerm) || this.task.toUpperCase().includes(searchTerm) || this.qualityString().toUpperCase().includes(searchTerm)) {
		return true;
	} else {
		return false;
	}
};

//event listeners
$('.save-button').on('click', function(e) {
	e.preventDefault();
	formSubmit();
});

$('section').on('click', '.upvote-button', upvoteCard);

$('section').on('click', '.downvote-button', downvoteCard);

$('section').on('click', '.delete-button', deleteCard);

$('section').on('click', 'h2', editTitle);

$('section').on('click', 'p', editTask);

$('section').on('focusout', '.edit-title', editTitleSave);

$('section').on('focusout', '.edit-task', editTaskSave);

$('section').on('keyup', '.edit-title', function(e) {
	if (e.keyCode === 13) {
		$(this).blur();
	}
});

$('section').on('keyup', '.edit-task', function(e) {
	if (e.keyCode === 13) {
		$(this).blur();
	}
});

$('.search').on('keyup', realtimeSearch)

$('.bottom-container').on('click', '.completed-task', completeBtn) //Adding new function

//collects title and body, runs constructor
function formSubmit() {
	var title = $('.title-input').val();
	var task = $('.task-input').val();
	var taskCard = new TaskCard(title, task);
	$('section').prepend(populateCard(taskCard)); 
	resetHeader();
	sendToLocalStorage();
};

//extracts values from HTML, inputs those values to constructor function which creates an ideaCard
function extractCard(elementInsideArticle) {
	var article = $(elementInsideArticle).closest('article');
	var title = $('.task-title', article).text();
	var task = $('.task-body', article).text();
	var id = article.data('id');
	var quality = $('.quality-span', article).data('quality');
	var taskCard = new TaskCard(title, task, id, quality);
	return taskCard;
};

//takes values from taskCard and inserts those values to HTML
function populateCard(taskCard) {
	var newTitle = taskCard.title;
	var newTask = taskCard.task;
	var newId = taskCard.id;
	var newQuality = taskCard.qualityString();
	return (`<article data-id="${newId}" class="task-card">  
				<div class="h2-wrapper">
					<h2 class="task-title">${newTitle}</h2>
					<button class="delete-button">
						<div class="delete-front">
							<img src="assets/delete.svg">
						</div>
					</button>
				</div>
				<p class="task-body">${newTask}</p>
				<div class="quality-wrapper">
					<button class="upvote-button">
						<div class="upvote-front">
							<img src="assets/upvote.svg">
						</div>
					</button>
					<button class="downvote-button">
						<div class="downvote-front">
							<img src="assets/downvote.svg">
						</div>
					</button>
					<h5 class="quality">quality: <span data-quality="${taskCard.quality}" class="quality-span">${newQuality}</span></h5>
					<button class="completed-task">Completed Task</button>
				</div>
				<hr>
			</article>`);
};

//replaces the quality string and saves quality
function upvoteCard() {
 	var taskCard = extractCard(this);
	taskCard.qualityIncrement();
	$(this).closest('article').replaceWith(populateCard(taskCard));
	sendToLocalStorage();
};

//replaces quality string and saves quality
function downvoteCard() {
 	var taskCard = extractCard(this);
	taskCard.qualityDecrement();
	$(this).closest('article').replaceWith(populateCard(taskCard));
	sendToLocalStorage();
};

function deleteCard(e) {
	e.preventDefault();
	$(this).closest('article').remove();
	sendToLocalStorage();
};

//edits and saves title and task
function editTitle() {
	var article = $(this).closest('article');
	$('h2', article).replaceWith(`<textarea class="task-title edit-title">${$(this).text()}</textarea>`);
	$('.edit-title').focus();
};

function editTask() {
	var article = $(this).closest('article');
	$('p', article).replaceWith(`<textarea class="task-body edit-task">${$(this).text()}</textarea>`);
	$('.edit-task').focus();
};

function editTitleSave() {
	$(this).replaceWith(`<h2 class="task-title">${$(this).val()}</h2>`);
	var taskCard = extractCard(this);
	$(this).closest('article').replaceWith(populateCard(taskCard));
	sendToLocalStorage();
};

function editTaskSave() {
	$(this).replaceWith(`<p class="task-body">${$(this).val()}</p>`);
	var taskCard = extractCard(this);
	$(this).closest('article').replaceWith(populateCard(taskCard));
	sendToLocalStorage();
};

//local storage functions
function sendToLocalStorage() {
	var cardArray = [];
	$('article').each(function (index, element) {
		cardArray.push(extractCard(element));
	});
	localStorage.setItem("storedCards", JSON.stringify(cardArray));
};

function getStoredCards() {
	var retrievedCards = JSON.parse(localStorage.getItem("storedCards")) || [];
	retrievedCards.forEach(function (retrievedCard) {
		var taskCard = new TaskCard(retrievedCard.title, retrievedCard.task, retrievedCard.id, retrievedCard.quality);
		$('section').append(populateCard(taskCard)); 
	});
};

//resets inpus and focus after save
function resetHeader() {
	$('.title-input').focus();
	$('.title-input').val('');
	$('.task-input').val('');
};

//runs .doYouMatch prototype and adds or removes class to display search matches
function realtimeSearch() {
	var searchTerm = $('.search').val().toUpperCase();
	$('article').each(function (index, element) {
		var taskCard = extractCard(element);
		if (taskCard.doYouMatch(searchTerm)) {
			$(element).removeClass('card-display-none');
		} else {
			$(element).addClass('card-display-none');
		};
	});
};

function completeBtn(e) {
	e.preventDefault();
	$(this).closest('article').wrap("<del>");
	sendToLocalStorage();
};




