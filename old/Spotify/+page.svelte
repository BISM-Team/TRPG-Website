<script lang="ts">
    import { onMount } from "svelte";
    

    let load=false;
    let playback_ready=false;
    let token: string | null = null;
    onMount(async () => {
        const res = await fetch(window.location.origin+window.location.pathname+'/SpotifyLogin');
        token = await res.text();
        load=true;

        window.onSpotifyWebPlaybackSDKReady = () => {
            playback_ready=true;
            loadSpotify();
        }
    });

    function loadSpotify() {
        const player = new Spotify.Player({
            name: 'Web Playback SDK Quick Start Player',
            getOAuthToken: cb => { cb(token); },
            volume: 0.5
        });

        // Ready
        player.addListener('ready', async ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            let request = new Request('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 'device_ids': [device_id] })
            });
            console.log(await fetch(request));
        });

        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        player.addListener('initialization_error', ({ message }) => {
            console.error(message);
        });

        player.addListener('authentication_error', ({ message }) => {
            console.error(message);
        });

        player.addListener('account_error', ({ message }) => {
            console.error(message);
        });

        document.getElementById('togglePlay').onclick = function() {
            player.togglePlay();
        };

        player.connect();
    }
</script>

<h1>Spotify Web Playback SDK Quick Start</h1>
{#if load}
<script src="https://sdk.scdn.co/spotify-player.js"></script>
{/if}
<button id="togglePlay">Toggle Play</button>