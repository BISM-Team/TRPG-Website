<header class='w3-container w3-center w3-teal w3-padding-16'>
    <h1>BISM Website</h1>
    <nav>
        <a href="GameWiki">Game Wiki</a>
        <a href="WorldWiki">World Wiki</a>
    </nav>
</header>

<slot></slot>

<style>
    h1 {
        margin-top: 0;
    }

    a {
        text-decoration: none;
    }

    nav {
        display: flex;
        flex-direction: row;
        height: 20%;
        width: 100%;
        justify-content: space-evenly;
    }

    nav > * {
        background-color: rgba(0, 255, 255, 0.363);
    }
</style>