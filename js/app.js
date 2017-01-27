var activities = [
  {
    title: "Keep Calm and Carry On",
    thumbnail_url : "https://thimble.mozilla.org/img/thumbnail-keep-calm.png",
    url: "https://thimble.mozilla.org/en-US/projects/72/",
    description: "This is activity one, the first activity!",
    tags: ["css","html","color"]
  },
  {
    title: "Back to School Postcard",
    thumbnail_url : "https://thimble.mozilla.org/img/thumbnail-postcard.png",
    url: "https://thimble.mozilla.org/en-US/projects/72/",
    description: "This is activity two, the second activity!",
    tags: ["images","code","javascript","interactive"]  
  },
  {
    title: "Current Events Comic",
    thumbnail_url : "https://thimble.mozilla.org/img/thumbnail-comic-strip.png",
    url: "https://thimble.mozilla.org/en-US/projects/72/",
    description: "This is activity two, the second activity!",
    tags: ["fun","images","attribution","search"]
  },
 
  {
    title: "Three Things I <3",
    thumbnail_url : "https://thimble.mozilla.org/img/thumbnail-three-things-i-heart.png",
    url: "https://thimble.mozilla.org/en-US/projects/72/",
    description: "This is activity two, the second activity!",
    tags: ["images","links"]  
  },
  {
    title: "Homework Excuse Generator",
    thumbnail_url : "https://thimble.mozilla.org/img/thumbnail-homework-excuse-generator.png",
    url: "https://thimble.mozilla.org/en-US/projects/72/",
    description: "This is activity two, the second activity!",
    tags: ["code","array","javascript"]
  },
  {
    title: "My Six Word Summer",
    thumbnail_url : "https://thimble.mozilla.org/img/thumbnail-my-six-word-summer.png",
    url: "https://thimble.mozilla.org/en-US/projects/72/",
    description: "This is activity one, the first activity!",
    tags: ["css","html","writing"]
  }, 
  
];

var gallery;

$(document).ready(function(){
  gallery = nunjucks.render('gallery.html', { activities: activities });

  $(".result").html(gallery);
  
  $("body").on("click",".tag",function(){
    changeTerm($(this).text());
  })

  $("body").on("click",".clear",function(){
    clear();
  });
  
  $(".search").on("keypress",function(){
    typed()
  });

});

var typeInterval;

function typed() {
  clearTimeout(typeInterval);
  typeInterval = setTimeout(function(){ 
    toggleClear();
    runSearch();
  }, 300);
}


function toggleClear(){
  var termLength = $(".search").val().length;
  if(termLength > 0) {
    $(".clear").show();
  } else {
    $(".clear").hide();
  }
}


function clear() {
  $(".search").val("");
  $(".clear").hide();
  runSearch();
}


function changeTerm(term) {
  $(".search").val(term);
  var newVal = $(".search").val();
  runSearch();
  $(".clear").show();
}


function actuallyFilter(){
  var term = $(".search").val().toLowerCase();
  
  $(".activity").each(function(){
    $(this).hide();
    var title = $(this).find("h1").text().toLowerCase();
    var titleIndex = title.indexOf(term);
    var tags = $(this).find(".tags").text().toLowerCase();
    var tagIndex = tags.indexOf(term);
    if(tagIndex > -1 || titleIndex > -1) {
      $(this).show();
    }
  });
}

function runSearch(){
  $(".activities").addClass("fade");
  $(".popular-tags").addClass("fade");
  setTimeout(function(){
    $(".activities").removeClass("fade");
    $(".popular-tags").removeClass("fade");
  },500)

  setTimeout(function(){
    actuallyFilter();
  },250)

}

