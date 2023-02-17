<script lang="ts">
    import type { ActionData } from './$types';
    import { enhance } from '$app/forms';

    let disable=false;
    let login_or_register=true;
    export let form: ActionData;
</script>

<header>
    <button disabled={disable} on:click={() => {login_or_register=false}}>Login</button>
    <button disabled={disable} on:click={() => {login_or_register=true}}>Register</button>
</header>

{#if !login_or_register}
    <form action="?/login" method="post" use:enhance>
        <fieldset disabled={disable}>
            <label>
                Username or Email
                <input required type="text" name="identifier" id="identifier_input" value={form?.identifier ?? ''}/>
            </label>
            {#if form?.identifier_missing} <p class='error'>Missing Username or Email</p> {/if}
            <label>
                Password
                <input required type="password" name="password" id="password_input"/>
            </label>
            {#if form?.password_missing} <p class='error'>Missing Password</p> {/if}
        </fieldset>
        {#if form?.unspecified_error} <p class='error'>Error, service might be unavailable</p>
        {:else if form?.login_failed} <p class='error'>Username/Email or Password incorrect</p> {/if}
        <div>
            <button disabled={disable} type="submit">Login</button>
        </div>
    </form>
{:else}
    <form action="?/register" method="post" use:enhance>
        <fieldset disabled={disable}>
            <label>
                Username
                <input required type="text" name="name" id="username_input" value={form?.name ?? ''}/>
            </label>
            {#if form?.name_missing} <p class='error'>Missing Username</p>
            {:else if form?.name_already_existing} <p class='error'>Username already taken</p> {/if}
            <label>
                Email
                <input required type="email" name="email" id="email_input" value={form?.email ?? ''}/>
            </label>
            {#if form?.email_missing} <p class='error'>Missing Email</p>
            {:else if form?.email_already_existing} <p class='error'>Email already registered</p> {/if}
            <label>
                Password
                <input required type="password" name="password" id="password_input"/>
            </label>
            {#if form?.password_missing} <p class='error'>Missing Password</p> {/if}
        </fieldset>
        {#if form?.unspecified_error} <p class='error'>Error, service might be unavailable</p> {/if}
        <div>
            <button disabled={disable} type="submit">Register</button>
        </div>
    </form>
{/if}