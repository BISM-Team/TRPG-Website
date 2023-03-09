<script lang="ts">
    import type { PageData } from './$types';
    import { scale } from 'svelte/transition';
    import { flip } from '$lib/Campaign/better_animations';
    import Card from './card.svelte';
    import Prototype from './prototype.svelte';
    import { spring, type Spring } from 'svelte/motion'
    import { onMount } from 'svelte';
    import { arraymove } from '$lib/utils';
    
    export let data: PageData;
    const transition_delay=0, transition_duration=300;
    const animate_delay=0, animate_duration=15;
    const stiffness=0.6, damping=1.0;
    const trace_refractary_perioid=500, drag_refractary_period=1000;
    let text='';
    let picked : {startingIndex: number, index:number, id: number, geometry: DOMRect, data: typeof data.elements[0], refractary: boolean, lastHoverEv: MouseEvent | undefined} | undefined = undefined;
    let resizing : {index: number, id: number, starting_top_left: {top: number, left: number}} | undefined = undefined;
    let actionData: Spring<{x_or_width: number, y_or_height: number}> = spring({x_or_width:0, y_or_height:0}, {stiffness, damping});

    onMount(() => {
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('keydown', keydown);

        return () => {
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            document.removeEventListener('keydown', keydown);
        }
    })
    
    function addElement(content: string) {
        let id: number;
        for(id=0; data.elements.findIndex(element => element.id===id)!==-1; ++id) {}
        data.elements[data.elements.length] = {id: id, content: content}
    }

    function removeElement(ev: any) {
        data.elements = data.elements.filter(element => element.id!==ev.detail.id);
    }

    function pickElement(ev: any) {
        cancelAction();
        const index = data.elements.findIndex(element => element.id===ev.detail.id);
        if(index===-1) throw new Error('Id not found in cards');
        picked = {
            startingIndex: index,
            index: index,
            id: ev.detail.id,
            geometry: ev.detail.geometry,
            data: data.elements[index],
            refractary: false,
            lastHoverEv: undefined
        }
        actionData = spring({x_or_width: ev.detail.geometry.x+window.scrollX, y_or_height: ev.detail.geometry.y+window.scrollY}, {stiffness, damping})
        const mousepos = ev.detail.mousepos;
        actionData.set({x_or_width: mousepos.x-(picked.geometry.width/2), y_or_height: mousepos.y-(picked.geometry.height/2)});
    }

    function resizeElement(ev: any) {
        cancelAction();
        const index = data.elements.findIndex(element => element.id===ev.detail.id);
        if(index===-1) throw new Error('Id not found in cards');
        resizing = {
            index: index,
            id: ev.detail.id,
            starting_top_left: {top: ev.detail.geometry.top+window.scrollY, left: ev.detail.geometry.left+window.scrollX}
        }
        actionData = spring({x_or_width: ev.detail.geometry.width, y_or_height: ev.detail.geometry.height}, {stiffness, damping})
    }

    function cancelAction() {
        if(picked) {
            if(picked.index!==picked.startingIndex) {
                arraymove(data.elements, picked.index, picked.startingIndex);
            }
            picked=undefined;
        }
        if(resizing) {
            resizing=undefined;
        }
    }

    function confirmAction() {
        picked=undefined;
        if(resizing) {
            data.elements[resizing.index].width = $actionData.x_or_width;
            data.elements[resizing.index].height = $actionData.y_or_height;
            resizing=undefined;
        }
    }

    function keydown(ev: KeyboardEvent) {
        if((picked || resizing) && (ev.key==='Escape' || ev.key==='Delete' || ev.key==='Backspace')) {
            ev.preventDefault();
            ev.stopPropagation();
            cancelAction();
        } else if((picked || resizing) && ev.key==='Enter') {
            ev.preventDefault();
            ev.stopPropagation();
            confirmAction();
        }
    }

    function mousemove(ev: MouseEvent) {
        if(picked) {
            ev.preventDefault();
            ev.stopPropagation();
            const mousepos = {x: ev.pageX, y: ev.pageY};
            actionData.set({x_or_width: mousepos.x-(picked.geometry.width/2), y_or_height: mousepos.y-(picked.geometry.height/2)});
            if(!picked.refractary) {
                const element = document.elementsFromPoint(mousepos.x-window.scrollX, mousepos.y-window.scrollY).find(element => {
                    return picked && element.id.startsWith('content') && !element.id.endsWith(`${picked.id}`)
                });
                if(element && element.id.startsWith('content')) {
                    picked.refractary=true; 
                    hoverElement(parseInt(element.id.replace('content', '')));
                    setTimeout(() => {
                        if(picked) { 
                            picked.refractary=false; 
                            if(picked.lastHoverEv) { 
                                mousemove(picked.lastHoverEv);
                                picked.lastHoverEv=undefined;
                            } 
                        }
                    }, drag_refractary_period)
                } else {
                    picked.refractary=true; 
                    setTimeout(() => { 
                        if(picked) { 
                            picked.refractary=false; 
                            if(picked.lastHoverEv) { 
                                mousemove(picked.lastHoverEv);
                                picked.lastHoverEv=undefined;
                            } 
                        }
                    }, trace_refractary_perioid)
                }
            } else {
                picked.lastHoverEv = ev;
            }
        } else if(resizing) {
            ev.preventDefault();
            ev.stopPropagation();
            const mousepos = {x: ev.pageX, y: ev.pageY};
            actionData.set({x_or_width: mousepos.x-resizing.starting_top_left.left, y_or_height: mousepos.y-resizing.starting_top_left.top});
        }
    }

    function mouseup(ev: any) {
        if(picked || resizing) {
            ev.preventDefault();
            ev.stopPropagation();
            confirmAction();
        }
    }

    function hoverElement(id: number) {
        if(picked) {
            const index = data.elements.findIndex(element => element.id===id);
            if(index===-1) throw new Error('Id not found in cards');
            if(index!==picked.index) {
                arraymove(data.elements, picked.index, index);
                picked.index=index;
            }
        }
    }
</script>

<input type="text" id="contentInput" bind:value={text} on:keydown={e => e.key === 'Enter' && addElement(text)}>

<div id="grid">
    {#each data.elements as element (element.id)}
        <div class="card" in:scale={{delay: transition_delay, duration: transition_duration}} out:scale={{delay: transition_delay, duration: transition_duration}} animate:flip={{delay: animate_delay, duration: d => Math.sqrt(d)*animate_duration}}>
            {#if picked && element.id===picked.id}
                <Prototype data={{id: element.id, width: picked.geometry.width, height: picked.geometry.height}}/>
            {:else if resizing && element.id===resizing.id}
                <Prototype data={{id: element.id, width: $actionData.x_or_width, height: $actionData.y_or_height}}/>
            {:else}
                <Card data={{picked: false, id: element.id, content: element.content, width: element.width, height: element.height}} on:pick={pickElement} on:resize={resizeElement} on:remove={removeElement}/>
            {/if}    
        </div>
    {/each}
</div>

{#if picked}
    <div class='pickedCard' style="top:{$actionData.y_or_height}px; left:{$actionData.x_or_width}px;">
        <Card data={{picked: true, id: picked.id, content: picked.data.content, width: picked.data.width, height: picked.data.height}}/>
    </div>
{/if}

<style>
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