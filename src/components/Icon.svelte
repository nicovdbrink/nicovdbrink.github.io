<script>
    import { findIconDefinition, icon } from '@fortawesome/fontawesome-svg-core'

    export let
        prefix = 'fas',
        name = '',
        classes = ''
</script>

{@html icon(findIconDefinition({
    prefix: prefix,
    iconName: name
}), { classes }).html}