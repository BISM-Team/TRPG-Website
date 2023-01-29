<script lang="ts">
    import { Character } from "../lib/Classes";
    import { character_def, nonsense_effect, nonsense_effect_2, PrepareSpells, prep_modifier, prep_modifier_2 } from "../lib/DnD";
    import { buildTree } from "../lib/Execution_tree";

    let character = new Character('Main Character', [character_def, PrepareSpells, nonsense_effect, nonsense_effect_2], [prep_modifier, prep_modifier_2]);
    let tree = buildTree(character);
    tree.invoke();
</script>

<p>{JSON.stringify(tree.scope)}</p>