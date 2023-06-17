<div class="content w3-card-4">
   <div class="main">
      <a href="#" class="buttonGreen">Heal</a>
      <input class= "input" type="number" aria-label="Health" min="0" max="500" value="">
      <a href="#" class="buttonRed">Damage</a>
    </div>
  <br>
  <br>
  <div class="main">
      <label class="label"> Current HP</label>
      <input class= "input" type="number" aria-label="Current HP" min="0" max="500" value="">
      <label class="label"> Max HP</label>
      <input readonly class= "input" type="number" aria-label="Max HP" min="0" max="500" value="">
     
    <br>
  </div>
</div>

<style lang="postcss">

    .content {
      padding: 2em;
      overflow: auto;
      background-color: white;
      width: 100%;
      height: 100%;
    }

    .main {
      display: flex;
      flex-direction: column;
      width: 100%;
      align-items: center;
    }
    .buttonRed {
    box-shadow:inset 0px 1px 0px 0px #f5978e;
    background:linear-gradient(to bottom, #f24537 5%, #c62d1f 100%);
    background-color:#f24537;
    border-radius:6px;
    border:1px solid #d02718;
    display:inline-block;
    cursor:pointer;
    color:#ffffff;
    font-family:Arial;
    font-size:15px;
    font-weight:bold;
    padding:6px 24px;
    text-decoration:none;
    text-shadow:0px 1px 0px #810e05;
    width: 8em;
    text-align: center;
  }
  .buttonRed:hover {
    background:linear-gradient(to bottom, #c62d1f 5%, #f24537 100%);
    background-color:#c62d1f;
  }
  .buttonRed:active {
    position:relative;
    top:1px;
  }     

  .buttonGreen {
	box-shadow:inset 0px 1px 0px 0px #9acc85;
	background:linear-gradient(to bottom, #74ad5a 5%, #68a54b 100%);
	background-color:#74ad5a;
  border-radius:6px;
	border:1px solid #3b6e22;
	display:inline-block;
	cursor:pointer;
	color:#ffffff;
	font-family:Arial;
	font-size:15px;
	font-weight:bold;
	padding:6px 12px;
	text-decoration:none;
  width: 8em;
  text-align: center;
}
.buttonGreen:hover {
	background:linear-gradient(to bottom, #68a54b 5%, #74ad5a 100%);
	background-color:#68a54b;
}
.buttonGreen:active {
	position:relative;
	top:1px;
}

.input {
  font-size:15px;
  width: 8em;
  text-align: right;
  margin-right: 5px;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}

  </style>