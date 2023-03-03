<script lang="ts">
    import type { ActionData } from './$types';
    import { enhance } from '$app/forms';
    import { afterNavigate, invalidateAll } from '$app/navigation';
    import type { SubmitFunction } from '@sveltejs/kit';

    let disable=false;
    let login_or_register=true;
    export let form: ActionData;
    let previousUrl: string = '';

    afterNavigate(({ from }) => {
        if(from) previousUrl = from.url.toString();
    })

    const onSubmit: SubmitFunction = async function() {
        return async ({ result, update }) => {
            if(result.type==='redirect') await invalidateAll();
            await update();
        }
    }

</script>

<header class='w3-border-top'>
    <button disabled={disable} on:click={() => {login_or_register=true}} class={login_or_register ? 'w3-button w3-block w3-blue-gray w3-hover-blue-gray' : 'w3-button w3-block w3-teal'}>Login</button>
    <button disabled={disable} on:click={() => {login_or_register=false}} class={!login_or_register ? 'w3-button w3-block w3-blue-gray w3-hover-blue-gray' : 'w3-button w3-block w3-teal'}>Register</button>
</header>

<div id='content' class='w3-padding-large'>
    {#if login_or_register}
        <form action="?/login" method="post" class='w3-padding-16' use:enhance={onSubmit}>
            <fieldset disabled={disable} class='w3-padding-16'>
                <input type="hidden" name="redirect" value={previousUrl}>

                <label for="identifier_input">Username or Email</label>
                <input required type="text" name="identifier" id="identifier_input" value={form?.identifier ?? ''} class='w3-input w3-border w3-margin-bottom'/>
                {#if form?.identifier_missing} <p class='w3-panel w3-red'>Missing Username or Email</p> {/if}
                
                <label for="password_input">Password</label>
                <input required type="password" name="password" id="password_input" class='w3-input w3-border'/>
                {#if form?.password_missing} <p class='w3-panel w3-red'>Missing Password</p> {/if}

                {#if form?.unspecified_error} <p class='w3-panel w3-red'>Error, service might be unavailable</p>
                {:else if form?.login_failed} <p class='w3-panel w3-red'>Username/Email or Password incorrect</p> {/if}
                <button disabled={disable} type="submit" class='w3-margin-top w3-button w3-teal w3-block'>Login</button>
            </fieldset>
        </form>
    {:else}
        <form action="?/register" method="post" class='w3-padding-16' use:enhance={onSubmit}>
            <fieldset disabled={disable} class='w3-padding-16'>
                <input type="hidden" name="redirect" value={previousUrl}>

                <label for="username_input">Username</label>
                <input required type="text" name="name" id="username_input" value={form?.name ?? ''} class='w3-input w3-border w3-margin-bottom'/>
                {#if form?.name_missing} <p class='w3-panel w3-padding w3-red'>Missing Username</p>
                {:else if form?.name_already_existing} <p class='w3-panel w3-padding w3-red'>Username already taken</p> {/if}
                
                <label for="email_input">Email</label>
                <input required type="email" name="email" id="email_input" value={form?.email ?? ''} class='w3-input w3-border w3-margin-bottom'/>
                {#if form?.email_missing} <p class='w3-panel w3-padding w3-red'>Missing Email</p>
                {:else if form?.email_already_existing} <p class='w3-panel w3-padding w3-red'>Email already registered</p> {/if}
                
                <label for="password_input">Password</label>
                <input required type="password" name="password" id="password_input" class='w3-input w3-border'/>
                {#if form?.password_missing} <p class='w3-panel w3-padding w3-red'>Missing Password</p> {/if}

                {#if form?.unspecified_error} <p class='w3-panel w3-padding w3-red'>Error, service might be unavailable</p> {/if}
                <button disabled={disable} type="submit" class='w3-button w3-teal w3-block'>Register</button>
            </fieldset>
        </form>
    {/if}
</div>

<style>
    header {
        display: flex;
        flex-direction: row;
        height: 3em;
        width: 100%;
        justify-content: space-evenly;
    }

    fieldset:last-of-type input {
        margin-bottom: 1.5em
    }
</style>