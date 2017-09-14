//setting focus in title input, retrieve local storage
$(document).ready(function() {
	$('.title-input').focus();
	getStoredCards();
});

//constructor function and prototypes
var TaskCard = function(title, task, id = Date.now(), importance = 0, complete = false) {
	this.title = title;
	this.task = task;
	this.id = id; 
	this.importance = importance;
	this.complete = complete;
};

TaskCard.prototype.finishTask = function() {
	 return this.complete = !this.complete;
}

//connects the quailty index to the string in that index
TaskCard.prototype.importanceString = function() {
	var importanceArray = ['Critical', 'High', 'Normal', 'Low', 'None'];
	return importanceArray[this.importance]; //this = TaskCard
};

//increments the importance value
TaskCard.prototype.importanceIncrement = function() { 
	if (this.importance < 4) {
		this.importance++;
	}
};

//decrements the importance value
TaskCard.prototype.importanceDecrement = function() {
	if (this.importance > 0) {
		this.importance--;
	}
};

//checks for matches in title, body and importance in the search input
TaskCard.prototype.doYouMatch = function(searchTerm) {
	debugger
	if (this.title.toUpperCase().includes(searchTerm) || this.task.toUpperCase().includes(searchTerm) || this.importanceString().toUpperCase().includes(searchTerm)) {
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

$('.bottom-container').on('click', '.completed-task', completeTask) //Adding new function

$('.criticalBtn').on('click', importanceSearch)
$('.highBtn').on('click', importanceSearch)
$('.normalBtn').on('click', importanceSearch)
$('.lowBtn').on('click', importanceSearch)
$('.noneBtn').on('click', importanceSearch)
$('.displayBtn').on('click', importanceSearch)

// $('.displayBtn').on('click', displayComplete)



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
	var importance = $('.importance-span', article).data('importance');
	var complete = article.data('status');
	var taskCard = new TaskCard(title, task, id, importance, complete);
	return taskCard;
};

//takes values from taskCard and inserts those values to HTML
function populateCard(taskCard) {
	var newTitle = taskCard.title;
	var newTask = taskCard.task;
	var newId = taskCard.id;
	var newImportance = taskCard.importanceString();
	var newComplete = taskCard.complete; 
	return (`<article data-status="${newComplete}" data-id="${newId}" class="task-card">  
				<div class="h2-wrapper">
					<h2 class="task-title">${newTitle}</h2>
					<button class="delete-button">
						<div class="delete-front">
							<img src="assets/delete.svg">
						</div>
					</button>
				</div>
				<p class="task-body">${newTask}</p>
				<div class="importance-wrapper">
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
					<h5 class="importance">importance: <span data-importance="${taskCard.importance}" class="importance-span">${newImportance}</span></h5>
					<button class="completed-task">Completed Task</button>
				</div>
				<hr>
			</article>`);
};

//replaces the importance string and saves importance
function upvoteCard() {
 	var taskCard = extractCard(this);
	taskCard.importanceIncrement();
	$(this).closest('article').replaceWith(populateCard(taskCard));
	sendToLocalStorage();
};

//replaces importance string and saves importance
function downvoteCard() {
 	var taskCard = extractCard(this);
	taskCard.importanceDecrement();
	$(this).closest('article').replaceWith(populateCard(taskCard));
	sendToLocalStorage();
};

function deleteCard(e) {
	e.preventDefault();
	$(this).closest('article').remove();
	sendToLocalStorage();
};

function completeTask(e) {
	e.preventDefault();
	var thisArticlesId = $(this).closest('article').data('id');
	var taskCard = extractCard(this);
	taskCard.finishTask();
	$(this).closest('article').replaceWith(populateCard(taskCard))
	$(".bottom-container").find(`[data-id='${thisArticlesId}']`).wrap("<del>").addClass('card-display-none');
	sendToLocalStorage();

}

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
		var taskCard = new TaskCard(retrievedCard.title, retrievedCard.task, retrievedCard.id, retrievedCard.importance, retrievedCard.complete);
		$('section').append(populateCard(taskCard));

		}
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


function translateImportance(buttonClass) {
	var importanceClicked;
	if (buttonClass === 'criticalBtn') {
		importanceClicked = 0;
	} else if (buttonClass === 'highBtn') {
		importanceClicked = 1;
	}  else if (buttonClass === 'normalBtn') {
	  	importanceClicked = 2;
	}	else if (buttonClass === 'lowBtn') {
		importanceClicked = 3;
	} 	else if (buttonClass === 'noneBtn') {
		importanceClicked = 4;
	}	else if (buttonClass === 'displayBtn') {
		imprtanceClicked = (0, 1, 2, 3, 4)
	}
	return importanceClicked;
	} 
	

function displayComplete(buttonClass) {
	console.log('hi')
	if (data-status === true) {
		return data-status;
	}
}


function importanceSearch(e) { 
	var buttonClass = $(e.target).attr('class')
	var importanceClicked  = translateImportance(buttonClass)
	$('article').each(function (index, element) {
		var taskCard = extractCard(element);
		if (taskCard.importance === importanceClicked) {
			$(element).removeClass('card-display-none');
		} else {
			$(element).addClass('card-display-none');
		};
	});
};





