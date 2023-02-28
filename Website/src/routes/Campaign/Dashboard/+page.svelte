<script lang="ts">
    import type { PageData } from './$types';
    import { scale } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import Card from './card.svelte';
    import Prototype from './prototype.svelte';
    import { spring, type Spring } from 'svelte/motion'
    import { onMount } from 'svelte';
    import { arraymove } from '$lib/utils';
    
    export let data: PageData;
    const transition_delay=0, transition_duration=300;
    const animate_delay=0, animate_duration = 500;
    const stiffness=0.6, damping=1.0;
    const drag_refractary_period=400;
    let text='';
    let picked : {startingIndex: number, index:number, id: number, geometry: DOMRect, data: typeof data.elements[0], refractary: boolean} | undefined = undefined;
    let pickedPosition: Spring<{x: number, y: number}> = spring({x:0, y:0}, {stiffness, damping});

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
        const index = data.elements.findIndex(element => element.id===ev.detail.id);
        if(index===-1) throw new Error('Id not found in cards');
        picked = {
            startingIndex: index,
            index: index,
            id: ev.detail.id,
            geometry: ev.detail.geometry,
            data: data.elements[index],
            refractary: false
        }
        pickedPosition = spring({x: ev.detail.geometry.x+window.scrollX, y: ev.detail.geometry.y+window.scrollY}, {stiffness, damping})
        const mousepos = ev.detail.mousepos;
        pickedPosition.set({x: mousepos.x-(picked.geometry.width/2), y: mousepos.y-(picked.geometry.height/2)});
    }

    function cancelPick() {
        if(picked) {
            arraymove(data.elements, picked.index, picked.startingIndex);
            data.elements=data.elements;
            picked=undefined;
        }
    }

    function confirmMove() {
        picked=undefined;
    }

    function keydown(ev: KeyboardEvent) {
        if(picked && (ev.key==='Escape' || ev.key==='Delete' || ev.key==='Backspace')) {
            ev.preventDefault();
            ev.stopPropagation();
            cancelPick();
        } else if(picked && ev.key==='Enter') {
            ev.preventDefault();
            ev.stopPropagation();
            confirmMove();
        }
    }

    function mousemove(ev: MouseEvent) {
        if(picked) {
            ev.preventDefault();
            ev.stopPropagation();
            const mousepos = {x: ev.pageX, y: ev.pageY};
            const element = document.elementsFromPoint(mousepos.x-window.scrollX, mousepos.y-window.scrollY).find(element => {
                return picked && element.id.startsWith('content') && !element.id.endsWith(`${picked.id}`)
            });
            if(!picked.refractary && element && element.id.startsWith('content')) { 
                hoverElement(parseInt(element.id.replace('content', '')));
                picked.refractary=true;
                setTimeout(() => {if(picked) picked.refractary=false}, drag_refractary_period)
            }
            pickedPosition.set({x: mousepos.x-(picked.geometry.width/2), y: mousepos.y-(picked.geometry.height/2)});
        }
    }

    function mouseup(ev: any) {
        if(picked) {
            ev.preventDefault();
            ev.stopPropagation();
            confirmMove();
        }
    }

    function hoverElement(id: number) {
        if(picked) {
            const index = data.elements.findIndex(element => element.id===id);
            if(index===-1) throw new Error('Id not found in cards');
            arraymove(data.elements, picked.index, index);
            data.elements=data.elements;
            picked.index=index;
        }
    }
</script>

<input type="text" id="contentInput" bind:value={text} on:keydown={e => e.key === 'Enter' && addElement(text)}>

<div id="grid">
    {#each data.elements as element, index (element.id)}
        <div class="card" in:scale={{delay: transition_delay, duration: transition_duration}} out:scale={{delay: transition_delay, duration: transition_duration}} animate:flip={{delay: animate_delay, duration: d => Math.sqrt(d*animate_duration)}}>
            {#if picked && element.id===picked.id}
                <Prototype data={{index: index, id: element.id, content: element.content, width: element.width || picked.geometry.width, height: element.height || picked.geometry.height}} on:pick={pickElement} on:remove={removeElement}/>
            {:else}
                <Card data={{picked: false, index: index, id: element.id, content: element.content, width: element.width, height: element.height}} on:pick={pickElement} on:remove={removeElement}/>
            {/if}    
        </div>
    {/each}
</div>

{#if picked}
    <div class='pickedCard' style="top:{$pickedPosition.y}px; left:{$pickedPosition.x}px;">
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