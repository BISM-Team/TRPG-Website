<script lang="ts">
    import type { ActionData, PageData } from "./$types";
    import { scale } from "svelte/transition";
    import { flip } from "$lib/Campaign/better_animations";
    import Card from "./card.svelte";
    import Prototype from "./prototype.svelte";
    import Modal from "../../../components/modal.svelte";
    import { spring, type Spring } from "svelte/motion";
    import { onMount } from "svelte";
    import { arraymove } from "$lib/utils";
    import { enhance, type SubmitFunction } from "$app/forms";

    export let data: PageData;
    export let form: ActionData;
    const transition_delay = 0,
        transition_duration = 300;
    const animate_delay = 0,
        animate_duration = 20;
    const stiffness = 0.6,
        damping = 1.0;
    const trace_refractary_perioid = 200,
        drag_refractary_period = 500;
    let picked:
        | {
              startingIndex: number;
              index: number;
              id: string;
              geometry: DOMRect;
              data: (typeof data.dashboard.cards)[0];
              refractary: boolean;
          }
        | undefined = undefined;
    let resizing:
        | {
              index: number;
              id: string;
              starting_top_left: { top: number; left: number };
          }
        | undefined = undefined;
    let actionData: Spring<{ x_or_width: number; y_or_height: number }> =
        spring({ x_or_width: 0, y_or_height: 0 }, { stiffness, damping });

    let removeDialog = { show: false, id: "" };
    let showCreateDialog = false;
    let disable = false;

    onMount(() => {
        document.addEventListener("mousemove", moveWhileDragging);
        document.addEventListener("mouseup", endAction);
        document.addEventListener("keydown", keydown);
        document.addEventListener("mouseleave", cancelAction);

        return () => {
            document.removeEventListener("mousemove", moveWhileDragging);
            document.removeEventListener("mouseup", endAction);
            document.removeEventListener("keydown", keydown);
        };
    });

    function toggleCreateDialog() {
        showCreateDialog = !showCreateDialog;
    }

    function toggleRemoveDialog(ev: any) {
        removeDialog = removeDialog.show
            ? { show: false, id: "" }
            : { show: true, id: ev.detail.id };
    }

    function startDragElement(ev: any) {
        cancelAction();
        const index = data.dashboard.cards.findIndex(
            (element) => element.id === ev.detail.id
        );
        if (index === -1) throw new Error("Id not found in cards");
        picked = {
            startingIndex: index,
            index: index,
            id: ev.detail.id,
            geometry: ev.detail.geometry,
            data: data.dashboard.cards[index],
            refractary: false,
        };
        actionData = spring(
            {
                x_or_width: ev.detail.geometry.x + window.scrollX,
                y_or_height: ev.detail.geometry.y + window.scrollY,
            },
            { stiffness, damping }
        );
        const mousepos = ev.detail.mousepos;
        actionData.set({
            x_or_width: mousepos.x - picked.geometry.width / 2,
            y_or_height: mousepos.y - picked.geometry.height / 2,
        });
    }

    function startResizeElement(ev: any) {
        cancelAction();
        const index = data.dashboard.cards.findIndex(
            (element) => element.id === ev.detail.id
        );
        if (index === -1) throw new Error("Id not found in cards");
        resizing = {
            index: index,
            id: ev.detail.id,
            starting_top_left: {
                top: ev.detail.geometry.top + window.scrollY,
                left: ev.detail.geometry.left + window.scrollX,
            },
        };
        actionData = spring(
            {
                x_or_width: ev.detail.geometry.width,
                y_or_height: ev.detail.geometry.height,
            },
            { stiffness, damping }
        );
    }

    function cancelAction() {
        if (picked) {
            if (picked.index !== picked.startingIndex) {
                arraymove(
                    data.dashboard.cards,
                    picked.index,
                    picked.startingIndex
                );
            }
            picked = undefined;
        }
        if (resizing) {
            resizing = undefined;
        }
    }

    function confirmAction() {
        picked = undefined;
        if (resizing) {
            data.dashboard.cards[resizing.index].width = $actionData.x_or_width;
            data.dashboard.cards[resizing.index].height =
                $actionData.y_or_height;
            resizing = undefined;
        }
    }

    function keydown(ev: KeyboardEvent) {
        if (
            (picked || resizing) &&
            (ev.key === "Escape" ||
                ev.key === "Delete" ||
                ev.key === "Backspace")
        ) {
            ev.preventDefault();
            ev.stopPropagation();
            cancelAction();
        } else if ((picked || resizing) && ev.key === "Enter") {
            ev.preventDefault();
            ev.stopPropagation();
            confirmAction();
        }
    }

    function moveWhileDragging(ev: MouseEvent) {
        if (picked) {
            ev.preventDefault();
            ev.stopPropagation();
            const mousepos = { x: ev.pageX, y: ev.pageY };
            actionData.set({
                x_or_width: mousepos.x - picked.geometry.width / 2,
                y_or_height: mousepos.y - picked.geometry.height / 2,
            });
            if (!picked.refractary) {
                const element = document
                    .elementsFromPoint(
                        mousepos.x - window.scrollX,
                        mousepos.y - window.scrollY
                    )
                    .find((element) => {
                        return (
                            picked &&
                            element.id.startsWith("content") &&
                            !element.id.endsWith(`${picked.id}`)
                        );
                    });
                if (element && element.id.startsWith("content")) {
                    picked.refractary = true;
                    hoverWhileDragging(element.id.replace("content", ""));
                    setTimeout(() => {
                        if (picked) {
                            picked.refractary = false;
                        }
                    }, drag_refractary_period);
                } else {
                    picked.refractary = true;
                    setTimeout(() => {
                        if (picked) {
                            picked.refractary = false;
                        }
                    }, trace_refractary_perioid);
                }
            }
        } else if (resizing) {
            ev.preventDefault();
            ev.stopPropagation();
            const mousepos = { x: ev.pageX, y: ev.pageY };
            actionData.set({
                x_or_width: mousepos.x - resizing.starting_top_left.left,
                y_or_height: mousepos.y - resizing.starting_top_left.top,
            });
        }
    }

    function endAction(ev: any) {
        if (picked || resizing) {
            ev.preventDefault();
            ev.stopPropagation();
            confirmAction();
        }
    }

    function hoverWhileDragging(id: string) {
        if (picked) {
            const index = data.dashboard.cards.findIndex(
                (element) => element.id === id
            );
            if (index === -1) throw new Error("Id not found in cards");
            if (index !== picked.index) {
                arraymove(data.dashboard.cards, picked.index, index);
                picked.index = index;
            }
        }
    }

    const submitCreateCard: SubmitFunction = async function () {
        disable = true;
        return async ({ result, update }) => {
            if (result.type === "success") toggleCreateDialog();
            disable = false;
            await update();
            const new_dashboard = form?.dashboard;
            if (new_dashboard) data.dashboard = new_dashboard;
        };
    };

    const submitRemoveCard: SubmitFunction = async function () {
        disable = true;
        return async ({ result, update }) => {
            if (result.type === "success") toggleRemoveDialog({});
            disable = false;
            await update();
            const new_dashboard = form?.dashboard;
            if (new_dashboard) data.dashboard = new_dashboard;
        };
    };
</script>

<button on:click={toggleCreateDialog} class="w3-center w3-teal w3-block"
    >New Card</button
>

<div id="grid">
    {#each data.dashboard.cards as card (card.id)}
        <div
            class="card"
            in:scale={{
                delay: transition_delay,
                duration: transition_duration,
            }}
            out:scale={{
                delay: transition_delay,
                duration: transition_duration,
            }}
            animate:flip={{
                delay: animate_delay,
                duration: (d) => Math.sqrt(d) * animate_duration,
            }}
        >
            {#if picked && card.id === picked.id}
                <Prototype
                    data={{
                        id: card.id,
                        width: picked.geometry.width,
                        height: picked.geometry.height,
                    }}
                />
            {:else if resizing && card.id === resizing.id}
                <Prototype
                    data={{
                        id: card.id,
                        width: $actionData.x_or_width,
                        height: $actionData.y_or_height,
                    }}
                />
            {:else}
                <Card
                    data={{
                        picked: false,
                        id: card.id,
                        source: card.source,
                        width: card.width,
                        height: card.height,
                    }}
                    on:pick={startDragElement}
                    on:resize={startResizeElement}
                    on:remove={toggleRemoveDialog}
                />
            {/if}
        </div>
    {/each}
</div>

{#if showCreateDialog}
    <Modal {disable} on:close={toggleCreateDialog}>
        <h3 class="w3-center">Create Card</h3>
        <form
            action="?/createCard"
            method="post"
            use:enhance={submitCreateCard}
        >
            <label for="nameInput">Name</label>
            <input type="text" name="name" id="nameInput" />
            <label for="heightInput">Height (px)</label>
            <input
                type="number"
                name="height"
                id="heightInput"
                value={form?.height || 200}
            />
            <label for="widthInput">Width (px)</label>
            <input
                type="number"
                name="width"
                id="widthInput"
                value={form?.width || 200}
            />
            <input type="hidden" name="zoom" id="nameInput" value={1} />
            <label for="sourceInput">Source</label>
            <input
                type="text"
                name="source"
                id="sourceInput"
                value={form?.source || ""}
            />
            <input type="hidden" name="dashboardId" value={data.dashboard.id} />
            <button type="button" on:click={toggleCreateDialog}>Cancel</button>
            <button type="submit">Create</button>
        </form>
    </Modal>
{/if}

{#if removeDialog.show}
    <Modal {disable} on:close={toggleRemoveDialog}>
        <h3 class="w3-center">Remove Card</h3>
        <form
            action="?/removeCard"
            method="post"
            use:enhance={submitRemoveCard}
        >
            <input type="hidden" name="cardId" value={removeDialog.id} />
            <input type="hidden" name="dashboardId" value={data.dashboard.id} />
            <button
                type="button"
                on:click={toggleRemoveDialog}
                class="w3-button">Cancel</button
            >
            <button type="submit" class="w3-button w3-teal">Remove</button>
        </form>
    </Modal>
{/if}

{#if picked}
    <div
        class="pickedCard"
        style="top:{$actionData.y_or_height}px; left:{$actionData.x_or_width}px;"
    >
        <Card
            data={{
                picked: true,
                id: picked.id,
                source: picked.data.source,
                width: picked.data.width,
                height: picked.data.height,
            }}
        />
    </div>
{/if}

<style>
    form label {
        display: block;
        margin-bottom: 0.5em;
    }
    form input {
        display: block;
        margin-bottom: 1em;
    }

    form button {
        margin: 2em;
    }

    #grid {
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        gap: 2em;
        margin: 4em;
    }

    .pickedCard {
        position: absolute;
        z-index: 100;
    }
</style>
