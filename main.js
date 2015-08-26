
var pics = [
    {
        img: "pic1.jpg",
        color: "#38A4FE"
    },
    {
        img: "pic2.jpg",
        color: "#3D9002"
    },
    {
        img: "pic3.jpg",
        color: "#34BCA3"
    },
    {
        img: "pic4.jpg",
        color: "#34BCA3"
    },
    {
        img: "pic6.jpg",
        color: "#FFC643"
    },
    {
        img: "pic7.jpg",
        color: "#EC006B"
    },
    {
        img: "pic8.jpg",
        color: "#DF2025"
    },
    {
        img: "pic9.jpg",
        color: "#007164"
    },
    {
        img: "pic10.jpg",
        color: "#2835FD"
    },
    {
        img: "pic11.jpg",
        color: "#0056B3"
    },
    {
        img: "pic12.jpg",
        color: "#900025"
    },
    {
        img: "pic13.jpg",
        color: "#FFC400"
    },
    {
        img: "pic14.jpg",
        color: "#018AAE"
    },
    {
        img: "pic15.jpg",
        color: "#860020"
    },
    {
        img: "pic16.jpg",
        color: "#637440"
    },
    {
        img: "pic17.jpg",
        color: "#41B4FF"
    },
    
];

function setImage(index) {
    var item = pics[index];
    document.getElementById("svg-image").setAttribute("xlink:href", "/img/" + item.img);
    var applyElements = document.querySelectorAll(".apply-span");
    for (var i = 0; i < applyElements.length; i++) {
        applyElements[i].style.color = item.color;
    };
}
setImage(Math.floor(Math.random() * pics.length));
