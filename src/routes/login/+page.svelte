<script lang="ts">
    import type { ActionData } from './$types';
    import { enhance } from '$app/forms';
    import { afterNavigate } from '$app/navigation';
    import type { SubmitFunction } from '@sveltejs/kit';
  import ErrorBar from '$lib/components/error_bar.svelte';

    let disabled=false;
    let login_or_register=true;
    export let form: ActionData;
    let previousUrl = "/";

    afterNavigate(({ from, to }) => {
        previousUrl = to?.url.searchParams.get("redirect") || from?.url.toString() || previousUrl;
    })

    const onSubmit: SubmitFunction = async function() {
      disabled=true;
        return async ({ update }) => {
          await update({reset: false});
          disabled=false;
        }
    }

</script>

<div class="p-8 w-full">
  <div id='content' class='pt-0 m-auto card shadow-xl w-[50%]'> 
    <div class='flex flex-row'>
      <button {disabled} on:click={() => {login_or_register=true}} class:btn-primary={login_or_register} class:btn-secondary={!login_or_register} class="block w-[50%] rounded-sm">Login</button>
      <button {disabled} on:click={() => {login_or_register=false}} class:btn-primary={!login_or_register} class:btn-secondary={login_or_register} class="block w-[50%] rounded-sm">Register</button>
    </div>

    {#if login_or_register}
        <form action="?/login" method="post" class='p-4' use:enhance={onSubmit}>
            <fieldset {disabled} class='p-1'>
                <input type="hidden" name="redirect" value={previousUrl}>

                <label class="label" for="email_input">Email</label>
                <input required type="text" autocomplete="email" name="username" id="email_input" value={form?.login_email ?? ''}  class='input w3-border w3-margin-bottom'/>
                
                {#if form?.login_email_missing} <ErrorBar text={"Missing Email."}/> {/if}

                <label class="label" for="password_input">Password</label>
                <input required type="password" autocomplete="current-password" name="password" id="password_input" class='input w3-border'/>
                {#if form?.login_password_missing} <ErrorBar text={"Missing Password."}/> {/if}

                {#if form?.login_server_error} <ErrorBar text={"Error, service might be unavailable"}/>
                {:else if form?.login_failed} <ErrorBar text={"Email or Password incorrect"}/> {/if}
                <div class="w-full text-center">
                  <button {disabled} type="submit" class='btn btn-primary'>Login</button>
                </div>
            </fieldset>
        </form>
    {:else}
        <form action="?/register" method="post" class='p-4' use:enhance={onSubmit}>
            <fieldset {disabled} class='p-1'>
                <input type="hidden" name="redirect" value={previousUrl}>

                <label class="label" for="username_input">Username</label>
                <input required type="text" name="name" id="username_input" value={form?.register_name ?? ''} class="input"/>
                {#if form?.register_name_missing} <ErrorBar text={"Missing Username"}/> {/if}

                <label class="label" for="email_input">Email</label>
                <input required type="email" autocomplete="email" name="username" id="email_input" value={form?.register_email ?? ''} class="input"/>
                {#if form?.register_email_missing} <ErrorBar text={"Missing Email"}/>
                {:else if form?.email_already_existing} <ErrorBar text={"Email already registered"}/> {/if}
                
                <label class="label" for="password_input">Password</label>
                <input required type="password" autocomplete="new-password" name="password" id="password_input" class="input"/>
                {#if form?.register_password_missing} <ErrorBar text={"Missing Password"}/> {/if}

                <label class="label" for="repeat_password">Repeat Password</label>
                <input required type="password" autocomplete="off" name="repeat_password" id="repeat_password" class="input"/>
                {#if form?.register_repeat_password_missing} <ErrorBar text={"Please repeat your Password"}/> 
                {:else if form?.register_password_mismatched} <ErrorBar text={"Passwords do not match!"}/> {/if}

                {#if form?.register_server_error} <ErrorBar text={"Error, service might be unavailable"}/> {/if}
                <div class="w-full text-center">
                  <button {disabled} type="submit" class='btn btn-primary'>Register</button>
                </div>
            </fieldset>
        </form>
    {/if}
  </div>
</div>

<style lang="postcss">
  </style>